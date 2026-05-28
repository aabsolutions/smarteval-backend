"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const groups_service_1 = require("./groups.service");
const create_group_dto_1 = require("./dto/create-group.dto");
const update_group_dto_1 = require("./dto/update-group.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let GroupsController = class GroupsController {
    constructor(groupsService) {
        this.groupsService = groupsService;
    }
    create(createGroupDto, req) {
        return this.groupsService.create(createGroupDto, req.user.userId);
    }
    findAll(req) {
        const userId = req.user.userId;
        const userRole = req.user.roles[0].name;
        return this.groupsService.findAll(userId, userRole);
    }
    findOne(id) {
        return this.groupsService.findOne(id);
    }
    update(id, updateGroupDto) {
        return this.groupsService.update(id, updateGroupDto);
    }
    remove(id) {
        return this.groupsService.remove(id);
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_group_dto_1.UpdateGroupDto]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "remove", null);
exports.GroupsController = GroupsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [groups_service_1.GroupsService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map