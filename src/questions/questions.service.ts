import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument, QuestionType } from './question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private cloudinaryService: CloudinaryService
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    const uploadResult: any = await this.cloudinaryService.uploadImage(file);
    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }

  private validateMatchingQuestion(type: QuestionType, options?: string[], correctAnswers?: string[]) {
    if (type === QuestionType.MATCHING) {
      if (!options || !correctAnswers || options.length !== correctAnswers.length) {
        throw new BadRequestException('Matching questions require options and correctAnswers to have the same length.');
      }
      if (options.length < 3) {
        throw new BadRequestException('Matching questions require at least 3 pairs.');
      }
    }
  }

  async create(createQuestionDto: CreateQuestionDto, teacherId: string): Promise<Question> {
    this.validateMatchingQuestion(createQuestionDto.type, createQuestionDto.options, createQuestionDto.correctAnswers);
    const createdQuestion = new this.questionModel({
      ...createQuestionDto,
      topicId: new Types.ObjectId(createQuestionDto.topicId),
      teacherId: new Types.ObjectId(teacherId),
    });
    return createdQuestion.save();
  }

  async createBulk(questions: CreateQuestionDto[], teacherId: string): Promise<Question[]> {
    questions.forEach(q => this.validateMatchingQuestion(q.type, q.options, q.correctAnswers));
    const questionsToInsert = questions.map(q => ({
      ...q,
      topicId: new Types.ObjectId(q.topicId),
      teacherId: new Types.ObjectId(teacherId),
    }));
    return this.questionModel.insertMany(questionsToInsert);
  }

  async findAllByTeacher(teacherId: string, topicId?: string): Promise<Question[]> {
    const filter: any = { teacherId: new Types.ObjectId(teacherId) };
    if (topicId) {
      filter.topicId = new Types.ObjectId(topicId);
    }
    return this.questionModel.find(filter).populate('topicId', 'name').exec();
  }

  async findOne(id: string, teacherId: string): Promise<Question> {
    const question = await this.questionModel.findOne({ _id: id, teacherId: new Types.ObjectId(teacherId) }).populate('topicId', 'name').exec();
    if (!question) {
      throw new NotFoundException(`Question #${id} not found or unauthorized`);
    }
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto, teacherId: string): Promise<Question> {
    if (updateQuestionDto.type === QuestionType.MATCHING || updateQuestionDto.options || updateQuestionDto.correctAnswers) {
        // Validation during update is tricky if we don't have the full object, 
        // but let's assume update replaces options and correctAnswers together if they are matching
        if (updateQuestionDto.type === QuestionType.MATCHING) {
            this.validateMatchingQuestion(updateQuestionDto.type, updateQuestionDto.options, updateQuestionDto.correctAnswers);
        }
    }
    const dataToUpdate = { ...updateQuestionDto };
    if (dataToUpdate.topicId) {
      (dataToUpdate as any).topicId = new Types.ObjectId(dataToUpdate.topicId);
    }
    
    const updatedQuestion = await this.questionModel
      .findOneAndUpdate(
        { _id: id, teacherId: new Types.ObjectId(teacherId) },
        dataToUpdate,
        { new: true },
      )
      .exec();
    if (!updatedQuestion) {
      throw new NotFoundException(`Question #${id} not found or unauthorized`);
    }
    return updatedQuestion;
  }

  async remove(id: string, teacherId: string): Promise<Question> {
    const deletedQuestion = await this.questionModel
      .findOneAndDelete({ _id: id, teacherId: new Types.ObjectId(teacherId) })
      .exec();
    if (!deletedQuestion) {
      throw new NotFoundException(`Question #${id} not found or unauthorized`);
    }

    if (deletedQuestion.imagePublicId) {
      try {
        await this.cloudinaryService.deleteImage(deletedQuestion.imagePublicId);
      } catch (e) {
        console.error('Failed to delete image from Cloudinary', e);
      }
    }

    return deletedQuestion;
  }
  async removeBulk(ids: string[], teacherId: string): Promise<any> {
    const questions = await this.questionModel.find({ _id: { $in: ids }, teacherId: new Types.ObjectId(teacherId) }).exec();
    const publicIds = questions.map(q => q.imagePublicId).filter(id => id);
    if (publicIds.length > 0) {
      publicIds.forEach(id => this.cloudinaryService.deleteImage(id as string).catch(e => console.error('Cloudinary delete error:', e)));
    }
    return this.questionModel.deleteMany({ _id: { $in: ids }, teacherId: new Types.ObjectId(teacherId) }).exec();
  }

  async updateBulkPoints(ids: string[], points: number, teacherId: string): Promise<any> {
    return this.questionModel.updateMany(
      { _id: { $in: ids }, teacherId: new Types.ObjectId(teacherId) },
      { $set: { points } }
    ).exec();
  }

  async generateDocxByTopic(topicId: string, teacherId: string): Promise<Buffer> {
    const questions = await this.findAllByTeacher(teacherId, topicId);
    if (!questions || questions.length === 0) {
      throw new NotFoundException('No se encontraron preguntas para este tema.');
    }

    const topicName = (questions[0].topicId as any).name || 'Banco de Preguntas';

    const children: any[] = [
      new Paragraph({
        text: `Banco de Preguntas: ${topicName}`,
        heading: HeadingLevel.TITLE,
      }),
      new Paragraph({ text: '' }), 
    ];

    questions.forEach((q, index) => {
      // Pregunta
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. `, bold: true }),
            new TextRun({ text: q.statement }),
          ],
        })
      );

      // Opciones
      if (q.type === QuestionType.MATCHING) {
        q.options.forEach((opt, i) => {
          children.push(
            new Paragraph({
              text: `   • ${opt}  ->  ${q.correctAnswers[i] || ''}`,
            })
          );
        });
      } else {
        q.options.forEach((opt, i) => {
          const letter = String.fromCharCode(97 + i); // a, b, c, d
          children.push(
            new Paragraph({
              text: `   ${letter}) ${opt}`,
            })
          );
        });
        
        // Respuestas
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `   Respuesta(s): `, bold: true }),
              new TextRun({ text: q.correctAnswers.join(', ') }),
            ],
          })
        );
      }
      
      const typeTranslations: Record<string, string> = {
        'single-choice': 'Opción Simple',
        'multiple-choice': 'Opción Múltiple',
        'true-false': 'Verdadero o Falso',
        'fill-blank': 'Completar Espacios',
        'matching': 'Emparejamiento',
      };
      const translatedType = typeTranslations[q.type] || q.type;

      children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `   Tipo: `, bold: true }),
              new TextRun({ text: translatedType }),
            ],
          })
        );

      children.push(new Paragraph({ text: '' })); // Spacing
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    return Packer.toBuffer(doc);
  }
}
