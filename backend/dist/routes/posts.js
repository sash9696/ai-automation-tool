"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postsController_1 = require("../controllers/postsController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/generate', validation_1.validateGeneratePost, postsController_1.generatePost);
router.get('/', postsController_1.getAllPosts);
router.get('/:id', postsController_1.getPostById);
router.put('/:id', postsController_1.updatePost);
router.delete('/:id', postsController_1.deletePost);
router.post('/schedule', validation_1.validateSchedulePost, postsController_1.schedulePost);
router.post('/:id/publish', postsController_1.publishPost);
router.get('/:id/analytics', postsController_1.getPostAnalytics);
exports.default = router;
//# sourceMappingURL=posts.js.map