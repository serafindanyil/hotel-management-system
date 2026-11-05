import { ApiProperty } from '@nestjs/swagger';

const PING_STATUSES = ['ok'] as const;

export class AdminPingResponse {
  @ApiProperty({ enum: PING_STATUSES, enumName: 'AdminPingStatus' })
  status: (typeof PING_STATUSES)[number];
}
