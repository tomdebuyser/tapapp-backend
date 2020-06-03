import { InternalServerErrorException } from '@nestjs/common';

export class ParseHtmlTemplateFailed extends InternalServerErrorException {
    constructor() {
        super(
            'PARSE_HTML_TEMPLATE_FAILED',
            'Something went wrong trying to parse a html email template.',
        );
    }
}
