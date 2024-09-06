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
  time: Time;
  module: BMCModule;
  logLevel: BMCLogLevel;
  source: BMCSource;
  data: string;
}
