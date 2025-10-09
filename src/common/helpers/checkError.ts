import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ICheckErrorArgs {
  error: FetchBaseQueryError | SerializedError | undefined;
  status: number;
  code?: string;
}

export const checkError = (args: ICheckErrorArgs): boolean => {
  const { error, status, code } = args;
  let result = false;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (error) result = error?.status === status;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (code) result = result && (error?.data?.ErrorCode || [])[0] === code;

  return result;
};
