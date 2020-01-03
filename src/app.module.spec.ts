import { AppModule } from './app.module';

describe('AppModule', () => {
    it('Should create an AppModule', () => {
        const module = new AppModule();
        expect(module).toBeDefined();
    });
});
