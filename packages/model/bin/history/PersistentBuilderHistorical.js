"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentBuilderHistorical = void 0;
const class_validator_1 = require("class-validator");
const PersistentBuilder_1 = require("../PersistentBuilder");
/**
 * one set of details of a version of a builder
 */
class PersistentBuilderHistorical extends PersistentBuilder_1.PersistentBuilder {
    /**
     * is the object deleted
     */
    isDeleted = false;
}
__decorate([
    (0, class_validator_1.IsBoolean)()
], PersistentBuilderHistorical.prototype, "isDeleted", void 0);
exports.PersistentBuilderHistorical = PersistentBuilderHistorical;
//# sourceMappingURL=PersistentBuilderHistorical.js.map