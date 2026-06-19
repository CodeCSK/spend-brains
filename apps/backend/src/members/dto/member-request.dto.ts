import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsString, Matches } from 'class-validator';
import {
  INDIAN_PHONE_E164_REGEX,
  normalizeIndianPhone,
} from '../../common/phone/normalize-indian-phone';

export class AddMemberDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'Phone of an existing Spendbrains user to add to the event',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeIndianPhone(value) : value,
  )
  @IsString()
  @Matches(INDIAN_PHONE_E164_REGEX, {
    message: 'phone must be a valid Indian mobile number',
  })
  phone!: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: [MemberRole.vice_captain, MemberRole.member],
    description: 'Captain cannot be reassigned via this endpoint',
  })
  @IsEnum(MemberRole)
  @IsIn([MemberRole.vice_captain, MemberRole.member])
  role!: MemberRole;
}
