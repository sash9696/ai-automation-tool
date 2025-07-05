"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const linkedInController_1 = require("../controllers/linkedInController");
const router = (0, express_1.Router)();
router.get('/auth-url', linkedInController_1.getAuthUrl);
router.post('/callback', linkedInController_1.handleCallback);
router.get('/status', linkedInController_1.getStatus);
router.post('/disconnect', linkedInController_1.disconnect);
router.post('/post', linkedInController_1.postToLinkedIn);
exports.default = router;
//# sourceMappingURL=linkedin.js.map