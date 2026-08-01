import { AssessmentType } from '@prisma/client';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, Max, Min } from 'class-validator';

export class CreateAssessmentDto {
  @IsEnum(AssessmentType)
  type!: AssessmentType;

  /** Uma resposta (0–3) por item da escala — validado contra o número exato
   * de itens do tipo escolhido no service (9 para PHQ-9, 7 para GAD-7). */
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(9)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(3, { each: true })
  answers!: number[];
}
