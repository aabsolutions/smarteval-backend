import { PartialType } from '@nestjs/mapped-types';
import { CreateLiveQuizDto } from './create-live-quiz.dto';

export class UpdateLiveQuizDto extends PartialType(CreateLiveQuizDto) {}
