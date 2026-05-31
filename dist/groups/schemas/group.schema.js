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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupSchema = exports.Group = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Group = class Group extends mongoose_2.Document {
};
exports.Group = Group;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Group.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Group.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Group.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Institution', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Group.prototype, "institution", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['MATUTINA', 'VESPERTINA', 'NOCTURNA', 'VIRTUAL'] }),
    __metadata("design:type", String)
], Group.prototype, "jornada", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['EGB MEDIA', 'EGB SUPERIOR', 'BACHILLERATO', 'SUPERIOR'] }),
    __metadata("design:type", String)
], Group.prototype, "nivel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Teacher', default: null }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Group.prototype, "teacher", void 0);
exports.Group = Group = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Group);
exports.GroupSchema = mongoose_1.SchemaFactory.createForClass(Group);
//# sourceMappingURL=group.schema.js.map