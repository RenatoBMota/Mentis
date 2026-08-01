import { AssessmentType } from '@prisma/client';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, Max, Min } from 'class-validator';

export class CreateAssessmentDto {
  @IsEnum(AssessmentType)
  type!: AssessmentType;

  /**
   * Uma resposta por item da escala — bounds aqui são só uma faixa larga
   * (5 a 20 itens, valores 0–5) cobrindo todos os tipos suportados. A
   * validação exata (nº de itens e valores aceitos por item de cada escala)
   * é feita em validateAnswers (assessment-scoring.ts), no service.
   */
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(5, { each: true })
  answers!: number[];
}
