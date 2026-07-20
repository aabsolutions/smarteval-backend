import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from './schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

// Escapa metacaracteres de regex para que el input del usuario se use como texto literal,
// no como patrón — evita ReDoS y errores de sintaxis si el usuario manda regex inválido.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
    private readonly notificationsService: NotificationsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async getUserInstitutionLogo(user: User): Promise<string | null> {
    const role = user.roles?.[0]?.name;
    if (!role) return null;

    try {
      if (role === 'STUDENT') {
        const StudentModel = this.connection.model('Student');
        const GroupModel = this.connection.model('Group');
        const InstitutionModel = this.connection.model('Institution');

        const student = await StudentModel.findOne({ identifier: user.username }).exec();
        if (student && student.groupId) {
          const group = await GroupModel.findById(student.groupId).exec();
          if (group && group.institution) {
            const institution = await InstitutionModel.findById(group.institution).exec();
            return institution?.logoUrl || null;
          }
        }
      } else if (role === 'TEACHER') {
        const TeacherModel = this.connection.model('Teacher');
        const GroupModel = this.connection.model('Group');
        const InstitutionModel = this.connection.model('Institution');

        const teacher = await TeacherModel.findOne({ identifier: user.username }).exec();
        if (teacher) {
          // Find any group assigned to this teacher
          const group = await GroupModel.findOne({ teacher: teacher._id }).exec();
          if (group && group.institution) {
            const institution = await InstitutionModel.findById(group.institution).exec();
            return institution?.logoUrl || null;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching institution logo:', error);
    }
    return null;
  }

  async findAll(allowedRoles: string[], page: number = 1, limit: number = 10, search?: string): Promise<{ data: User[], total: number }> {
    const query: any = { 'roles.name': { $in: allowedRoles } };

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { name: regex },
        { username: regex },
        { email: regex },
      ];
    }

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.userModel.find(query).select('-password').sort({ name: 1 }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query).exec()
    ]);
    
    return { data, total };
  }

  async update(id: string, updateData: any, file?: Express.Multer.File): Promise<User | null> {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'smarteval/users');
      updateData.avatar = uploadResult.secure_url;
    }
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    const query: any = { $set: updateData };
    
    if (updateData.email === '') {
      delete query.$set.email;
      query.$unset = { email: 1 };
    }
    
    const updatedUser = await this.userModel.findByIdAndUpdate(id, query, { new: true }).select('-password').exec();
    
    if (updatedUser && (updateData.name || updateData.email !== undefined)) {
      const syncData: any = {};
      if (updateData.name) syncData.name = updateData.name;
      if (updateData.email) syncData.email = updateData.email;

      const syncQuery: any = { $set: syncData };
      if (updateData.email === '') {
        syncQuery.$unset = { email: 1 };
      }

      try {
        const StudentModel = this.connection.model('Student');
        await StudentModel.updateMany({ identifier: updatedUser.username }, syncQuery);
      } catch (e) {}

      try {
        const TeacherModel = this.connection.model('Teacher');
        await TeacherModel.updateMany({ identifier: updatedUser.username }, syncQuery);
      } catch (e) {}
    }

    return updatedUser;
  }

  async delete(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async resetPassword(id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    if (!user.username) throw new BadRequestException('User does not have a username registered');
    
    const newPassword = await bcrypt.hash(user.username, 10);
    user.password = newPassword;
    await user.save();
    
    await this.notificationsService.create(
      id,
      'Contraseña reseteada',
      'Tu contraseña ha sido reseteada a tu nombre de usuario. Por tu seguridad, por favor cámbiala inmediatamente en tu perfil.',
      'WARNING'
    );
    
    return { success: true, message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    
    const isMatch = await bcrypt.compare(currentPass, user.password || '');
    if (!isMatch) {
      // Usando BadRequest porque Unauthorized es para fallos de JWT genéricos, pero throw Error funciona si no importé UnauthorizedException
      throw new BadRequestException('La contraseña actual es incorrecta');
    }
    
    user.password = await bcrypt.hash(newPass, 10);
    await user.save();
    
    return { success: true, message: 'Password changed successfully' };
  }

  async create(userData: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const createdUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  private async seedUsers() {
    try {
      const userCount = await this.userModel.countDocuments();
      const superAdminCount = await this.userModel.countDocuments({ username: 'superadmin' });

      if (userCount > 0 && superAdminCount > 0) {
        console.log('La base de datos ya contiene usuarios y al superadmin. Saltando el seeding.');
        return;
      }

      console.log('Iniciando el seeding de usuarios con NestJS...');

      const initialUsers = [];
      if (superAdminCount === 0) {
        const superAdminPassword = process.env.SUPERADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
        if (!process.env.SUPERADMIN_PASSWORD) {
          console.log(`[seed] Contraseña generada para 'superadmin': ${superAdminPassword} — guardala ahora, no se vuelve a mostrar.`);
        }
        initialUsers.push({
          username: 'superadmin',
          password: await bcrypt.hash(superAdminPassword, 10),
          name: 'Super Admin',
          email: 'superadmin@school.org',
          roles: [{ name: 'SUPERADMIN', priority: 0 }],
          permissions: ['canAdd', 'canDelete', 'canEdit', 'canRead'],
          avatar: 'admin.jpg',
        });
      }

      // Los usuarios demo (admin/teacher/student con password fija) solo se siembran fuera de producción.
      const allowDemoSeed = process.env.NODE_ENV !== 'production';
      if (allowDemoSeed && (userCount === 0 || (userCount > 0 && superAdminCount === 0 && userCount <= 3))) {
        // Solo agregar los defaults si no hay otros, para no duplicar admin/teacher si ya están creados por error
        initialUsers.push(
          {
            username: 'admin',
            password: await bcrypt.hash('admin@123', 10),
            name: 'Sarah Smith',
            email: 'admin@school.org',
            roles: [{ name: 'ADMIN', priority: 1 }],
            permissions: ['canAdd', 'canDelete', 'canEdit', 'canRead'],
            avatar: 'admin.jpg',
          },
          {
            username: 'teacher',
            password: await bcrypt.hash('teacher@123', 10),
            name: 'Ashton Cox',
            email: 'teacher@school.org',
            roles: [{ name: 'TEACHER', priority: 2 }],
            permissions: ['canAdd', 'canEdit', 'canRead'],
            avatar: 'teacher.jpg',
          },
          {
            username: 'student',
            password: await bcrypt.hash('student@123', 10),
            name: 'Cara Stevens',
            email: 'student@school.org',
            roles: [{ name: 'STUDENT', priority: 3 }],
            permissions: ['canRead'],
            avatar: 'student.jpg',
          }
        );
      }

      if (initialUsers.length === 0) {
        return;
      }

      await this.userModel.insertMany(initialUsers);
      console.log('Usuarios iniciales de NestJS creados/actualizados con éxito');
    } catch (error) {
      console.error('Error al sembrar usuarios en NestJS:', error);
    }
  }
}
