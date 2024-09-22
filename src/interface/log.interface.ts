interface Time {
  timestamp: number;
  millionsecond: number;
  readable: string;
}
interface BMCSource {
  file: string;
  line: number;
}
export enum BMCModule {
  Payload = "Payload",
  Smm = "Smm_Mgnt",
  Upgrade = "UPGRADE",
  CpuMem = "CpuMem",
}
export enum BMCLogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Error = "ERROR",
}
export default interface LogInterface {
  time: { start: number; end: number; data: Time };
  module: { start: number; end: number; data: BMCModule };
  logLevel: { start: number; end: number; data: BMCLogLevel };
  source: { start: number; end: number; data: BMCSource };
  data: { start: number; end: number; data: string };
}
