"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInstitutionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_institution_dto_1 = require("./create-institution.dto");
class UpdateInstitutionDto extends (0, mapped_types_1.PartialType)(create_institution_dto_1.CreateInstitutionDto) {
}
exports.UpdateInstitutionDto = UpdateInstitutionDto;
//# sourceMappingURL=update-institution.dto.js.map