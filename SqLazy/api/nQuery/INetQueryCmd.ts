/// <reference path='ISqlCmd.ts' />
/// <reference path='ISqlTarget.ts' />
interface INetQueryCmd{
    target: ISqlTarget;
    cmd: ISqlCmd
}