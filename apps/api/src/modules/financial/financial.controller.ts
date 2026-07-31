import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MarkSessionPaidDto } from './dto/mark-session-paid.dto';
import { FinancialService } from './financial.service';

class ListTransactionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

@UseGuards(JwtAuthGuard)
@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('transactions')
  list(@Query() query: ListTransactionsQueryDto) {
    return this.financialService.list(query.year, query.month);
  }

  @Post('transactions')
  create(@Body() dto: CreateTransactionDto) {
    return this.financialService.create(dto);
  }

  @Get('receivables-forecast')
  receivablesForecast() {
    return this.financialService.receivablesForecast();
  }

  @Patch('sessions/:id/mark-paid')
  markSessionPaid(@Param('id') id: string, @Body() dto: MarkSessionPaidDto) {
    return this.financialService.markSessionPaid(id, dto);
  }
}
