"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLiveQuizDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_live_quiz_dto_1 = require("./create-live-quiz.dto");
class UpdateLiveQuizDto extends (0, mapped_types_1.PartialType)(create_live_quiz_dto_1.CreateLiveQuizDto) {
}
exports.UpdateLiveQuizDto = UpdateLiveQuizDto;
//# sourceMappingURL=update-live-quiz.dto.js.map