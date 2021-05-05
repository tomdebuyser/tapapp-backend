import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { LoggerService } from '@libs/logger';
import { PayconiqConfig } from './payconiq.config';
import { PayconiqPaymentData } from './payconiq.types';
import {
    CancelPaymentFailed,
    CreatePaymentFailed,
    FetchPaymentFailed,
} from './payconiq.errors';

const context = 'PayconiqService';

@Injectable()
export class PayconiqService {
    constructor(
        private readonly config: PayconiqConfig,
        private readonly httpService: HttpService,
        private readonly logger: LoggerService,
    ) {}

    private get requestConfig(): AxiosRequestConfig {
        return {
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
        };
    }

    internalPaymentIdFromReference(reference: string): string {
        return `${reference.substr(0, 8)}-${reference.substr(
            8,
            4,
        )}-${reference.substr(12, 4)}-${reference.substr(
            16,
            4,
        )}-${reference.substr(20)}`;
    }

    referenceFromInternalPaymentId(internalPaymentId: string): string {
        // Lame, but Payconiq API limits the reference to 35 characters
        return internalPaymentId.replace(/-/g, '');
    }

    async createPayment(
        amount: number,
        orderId: string,
        internalPaymentId: string,
    ): Promise<PayconiqPaymentData> {
        try {
            const payload = {
                amount, // payconiq expresses the amount in cents
                callbackUrl: `${this.config.baseUrl}/api/webhooks/payconiq`,
                currency: 'EUR',
                description: `Betaling TAPAPP: ${orderId}`,
                reference: this.referenceFromInternalPaymentId(
                    internalPaymentId,
                ),
            };
            const { data } = await this.httpService
                .post<PayconiqPaymentData>(
                    this.config.apiUrl,
                    payload,
                    this.requestConfig,
                )
                .toPromise();
            return data;
        } catch (error) {
            this.logger.error(
                'Something went wrong creating payment with Payconiq REST API',
                { context, error },
            );
            throw new CreatePaymentFailed();
        }
    }

    async cancelPayment(payconiqPaymentId: string): Promise<void> {
        try {
            await this.httpService
                .delete(
                    `${this.config.apiUrl}/${payconiqPaymentId}`,
                    this.requestConfig,
                )
                .toPromise();
        } catch (error) {
            this.logger.error(
                'Something went wrong cancelling payment with Payconiq REST API',
                { context, error },
            );
            throw new CancelPaymentFailed();
        }
    }

    async fetchPayment(
        payconiqPaymentId: string,
    ): Promise<PayconiqPaymentData> {
        try {
            const { data } = await this.httpService
                .get<PayconiqPaymentData>(
                    `${this.config.apiUrl}/${payconiqPaymentId}`,
                    this.requestConfig,
                )
                .toPromise();
            return data;
        } catch (error) {
            this.logger.error(
                'Something went wrong fetching payment with Payconiq REST API',
                { context, error },
            );
            throw new FetchPaymentFailed();
        }
    }
}
