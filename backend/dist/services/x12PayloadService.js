"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12PayloadService = void 0;
class X12PayloadService {
    async generatePayloads(responses) {
        const request270 = await this.generate270Request(responses);
        const response271 = await this.generate271Response(responses);
        return { request270, response271 };
    }
    async generate270Request(responses) {
        const segments = [];
        const responseData = this.extractResponseData(responses);
        const isaSegment = this.buildISASegment(responseData, '270');
        segments.push(isaSegment);
        const gsSegment = this.buildGSSegment(responseData, '270');
        segments.push(gsSegment);
        segments.push({
            segmentId: 'ST',
            elements: ['270', this.generateControlNumber()],
            description: 'Transaction Set Header - Eligibility Inquiry'
        });
        segments.push({
            segmentId: 'BHT',
            elements: ['0022', '13', this.generateControlNumber(), this.getCurrentDate(), this.getCurrentTime()],
            description: 'Beginning of Hierarchical Transaction'
        });
        segments.push({
            segmentId: 'HL',
            elements: ['1', '', '20', '1'],
            description: 'Information Source Level'
        });
        const payerName = responseData['payer-name-270'] || 'SAMPLE_PAYER';
        const payerId = responseData['2100a-nm109-270'] || 'SAMPLE_ID';
        segments.push({
            segmentId: 'NM1',
            elements: ['PR', '2', payerName, '', '', '', '', 'PI', payerId],
            description: 'Information Source Name'
        });
        segments.push({
            segmentId: 'HL',
            elements: ['2', '1', '21', '1'],
            description: 'Information Receiver Level'
        });
        const orgName = responseData['organization-name'] || 'SAMPLE_ORGANIZATION';
        segments.push({
            segmentId: 'NM1',
            elements: ['1P', '2', orgName, '', '', '', '', 'XX', '1234567890'],
            description: 'Information Receiver Name'
        });
        segments.push({
            segmentId: 'HL',
            elements: ['3', '2', '22', '0'],
            description: 'Subscriber Level'
        });
        segments.push({
            segmentId: 'NM1',
            elements: ['IL', '1', 'DOE', 'JOHN', '', '', '', 'MI', 'MEMBER123'],
            description: 'Subscriber Name'
        });
        segments.push({
            segmentId: 'DMG',
            elements: ['D8', '19800101', 'M'],
            description: 'Subscriber Demographics'
        });
        segments.push({
            segmentId: 'EQ',
            elements: ['30'],
            description: 'Subscriber Eligibility Inquiry'
        });
        const segmentCount = segments.length + 1;
        segments.push({
            segmentId: 'SE',
            elements: [segmentCount.toString(), segments.find(s => s.segmentId === 'ST')?.elements[1] || '0001'],
            description: 'Transaction Set Trailer'
        });
        segments.push({
            segmentId: 'GE',
            elements: ['1', segments.find(s => s.segmentId === 'GS')?.elements[6] || '0001'],
            description: 'Functional Group Trailer'
        });
        segments.push({
            segmentId: 'IEA',
            elements: ['1', segments.find(s => s.segmentId === 'ISA')?.elements[13] || '000000001'],
            description: 'Interchange Control Trailer'
        });
        const payload = this.segmentsToX12String(segments);
        return {
            type: '270',
            payload,
            segments,
            metadata: {
                organizationName: orgName,
                implementationMode: responseData['implementation-mode-selection'] || 'real-time-web',
                generatedAt: new Date(),
                testCase: true
            }
        };
    }
    async generate271Response(responses) {
        const segments = [];
        const responseData = this.extractResponseData(responses);
        const isaSegment = this.buildISASegment(responseData, '271');
        segments.push(isaSegment);
        const gsSegment = this.buildGSSegment(responseData, '271');
        segments.push(gsSegment);
        segments.push({
            segmentId: 'ST',
            elements: ['271', this.generateControlNumber()],
            description: 'Transaction Set Header - Eligibility Response'
        });
        segments.push({
            segmentId: 'BHT',
            elements: ['0022', '11', this.generateControlNumber(), this.getCurrentDate(), this.getCurrentTime()],
            description: 'Beginning of Hierarchical Transaction'
        });
        segments.push({
            segmentId: 'HL',
            elements: ['1', '', '20', '1'],
            description: 'Information Source Level'
        });
        const payerName = responseData['payer-name-271'] || 'SAMPLE_PAYER';
        const payerId = responseData['2100a-nm109-271'] || 'SAMPLE_ID';
        segments.push({
            segmentId: 'NM1',
            elements: ['PR', '2', payerName, '', '', '', '', 'PI', payerId],
            description: 'Information Source Name'
        });
        segments.push({
            segmentId: 'HL',
            elements: ['2', '1', '21', '1'],
            description: 'Information Receiver Level'
        });
        const orgName = responseData['organization-name'] || 'SAMPLE_ORGANIZATION';
        segments.push({
            segmentId: 'NM1',
            elements: ['1P', '2', orgName, '', '', '', '', 'XX', '1234567890'],
            description: 'Information Receiver Name'
        });
        segments.push({
            segmentId: 'HL',
            elements: ['3', '2', '22', '0'],
            description: 'Subscriber Level'
        });
        segments.push({
            segmentId: 'NM1',
            elements: ['IL', '1', 'DOE', 'JOHN', '', '', '', 'MI', 'MEMBER123'],
            description: 'Subscriber Name'
        });
        segments.push({
            segmentId: 'DMG',
            elements: ['D8', '19800101', 'M'],
            description: 'Subscriber Demographics'
        });
        segments.push({
            segmentId: 'EB',
            elements: ['1', '', '', '', 'Active Coverage'],
            description: 'Eligibility or Benefit Information'
        });
        const segmentCount = segments.length + 1;
        segments.push({
            segmentId: 'SE',
            elements: [segmentCount.toString(), segments.find(s => s.segmentId === 'ST')?.elements[1] || '0001'],
            description: 'Transaction Set Trailer'
        });
        segments.push({
            segmentId: 'GE',
            elements: ['1', segments.find(s => s.segmentId === 'GS')?.elements[6] || '0001'],
            description: 'Functional Group Trailer'
        });
        segments.push({
            segmentId: 'IEA',
            elements: ['1', segments.find(s => s.segmentId === 'ISA')?.elements[13] || '000000001'],
            description: 'Interchange Control Trailer'
        });
        const payload = this.segmentsToX12String(segments);
        return {
            type: '271',
            payload,
            segments,
            metadata: {
                organizationName: orgName,
                implementationMode: responseData['implementation-mode-selection'] || 'real-time-web',
                generatedAt: new Date(),
                testCase: true
            }
        };
    }
    buildISASegment(responseData, transactionType) {
        const suffix = transactionType === '270' ? '-270' : '-271';
        const isa05 = responseData[`isa05${suffix}`] || '01';
        const isa06 = responseData[`isa06${suffix}`] || '030240928';
        const isa07 = responseData[`isa07${suffix}`] || '01';
        const isa08 = responseData[`isa08${suffix}`] || '030240928';
        const isa11 = responseData[`isa11${suffix}`] || '^';
        const isa16 = responseData[`isa16${suffix}`] || ':';
        const controlNumber = this.generateControlNumber();
        const currentDate = this.getCurrentDate();
        const currentTime = this.getCurrentTime();
        return {
            segmentId: 'ISA',
            elements: [
                '00',
                '          ',
                '00',
                '          ',
                isa05,
                isa06.padEnd(15),
                isa07,
                isa08.padEnd(15),
                currentDate,
                currentTime,
                isa11,
                '00501',
                controlNumber,
                '0',
                'T',
                isa16
            ],
            description: 'Interchange Control Header'
        };
    }
    buildGSSegment(responseData, transactionType) {
        const suffix = transactionType === '270' ? '-270' : '-271';
        const gs02 = responseData[`gs02${suffix}`] || '030240928';
        const gs03 = responseData[`gs03${suffix}`] || '030240928';
        const controlNumber = this.generateControlNumber();
        const currentDate = this.getCurrentDate();
        const currentTime = this.getCurrentTime();
        return {
            segmentId: 'GS',
            elements: [
                'HS',
                gs02,
                gs03,
                currentDate,
                currentTime,
                controlNumber,
                'X',
                '005010X279A1'
            ],
            description: 'Functional Group Header'
        };
    }
    extractResponseData(responses) {
        const data = {};
        responses.sections.forEach(section => {
            section.responses.forEach(response => {
                data[response.questionId] = response.value;
            });
        });
        return data;
    }
    segmentsToX12String(segments) {
        return segments.map(segment => {
            return segment.segmentId + '*' + segment.elements.join('*') + '~';
        }).join('\n');
    }
    generateControlNumber() {
        return Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    }
    getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return year + month + day;
    }
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return hours + minutes;
    }
    validatePayload(payload) {
        const errors = [];
        const requiredSegments = ['ISA', 'GS', 'ST', 'BHT', 'SE', 'GE', 'IEA'];
        const segmentIds = payload.segments.map(s => s.segmentId);
        requiredSegments.forEach(required => {
            if (!segmentIds.includes(required)) {
                errors.push(`Missing required segment: ${required}`);
            }
        });
        const isaIndex = segmentIds.indexOf('ISA');
        const ieaIndex = segmentIds.lastIndexOf('IEA');
        if (isaIndex !== 0) {
            errors.push('ISA segment must be first');
        }
        if (ieaIndex !== segmentIds.length - 1) {
            errors.push('IEA segment must be last');
        }
        if (!payload.payload.includes('ISA*') || !payload.payload.includes('~')) {
            errors.push('Invalid X12 format - missing segment terminators');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async generateTestCases(responses) {
        const basicEligibility = await this.generatePayloads(responses);
        const memberNotFoundResponses = JSON.parse(JSON.stringify(responses));
        const memberNotFound = await this.generatePayloads(memberNotFoundResponses);
        const activeWithBenefitsResponses = JSON.parse(JSON.stringify(responses));
        const activeWithBenefits = await this.generatePayloads(activeWithBenefitsResponses);
        return {
            basicEligibility,
            memberNotFound,
            activeWithBenefits
        };
    }
    formatPayloadForDisplay(payload) {
        return payload.segments.map(segment => {
            const segmentString = segment.segmentId + '*' + segment.elements.join('*') + '~';
            return `${segmentString.padEnd(80)} // ${segment.description}`;
        }).join('\n');
    }
    generatePayloadSummary(payload) {
        const keySegments = payload.segments
            .filter(s => ['ISA', 'GS', 'ST', 'BHT', 'NM1', 'EB', 'EQ'].includes(s.segmentId))
            .map(s => ({ segment: s.segmentId, description: s.description }));
        return {
            segmentCount: payload.segments.length,
            transactionType: payload.type,
            organizationName: payload.metadata.organizationName,
            implementationMode: payload.metadata.implementationMode,
            keySegments
        };
    }
}
exports.X12PayloadService = X12PayloadService;
//# sourceMappingURL=x12PayloadService.js.map