export interface IHandler<UseCase> {
    execute(arg: UseCase): unknown;
}
