"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const questionnaire_1 = __importDefault(require("./routes/questionnaire"));
const response_1 = __importDefault(require("./routes/response"));
const submissions_1 = __importDefault(require("./routes/submissions"));
const users_1 = __importDefault(require("./routes/users"));
const payers_1 = __importDefault(require("./routes/payers"));
const mockPayer_1 = __importDefault(require("./routes/mockPayer"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3003',
        'http://localhost:3004',
        process.env.FRONTEND_URL
    ].filter((url) => Boolean(url)),
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined'));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/api/questionnaires', questionnaire_1.default);
app.use('/api/responses', response_1.default);
app.use('/api/submissions', submissions_1.default);
app.use('/api/users', users_1.default);
app.use('/api', payers_1.default);
app.use('/api/mock-payer', mockPayer_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API docs: http://localhost:${PORT}/api`);
});
exports.default = app;
//# sourceMappingURL=index.js.map