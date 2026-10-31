import { Pipe } from "@angular/core";
import type { PipeTransform } from "@angular/core";
import type { PlateCountry } from "@core/models/ticket.model";
import { formatPlate } from "@shared/utils/plate.utils";
import type { FormatPlateOptions } from "@shared/utils/plate.utils";

@Pipe({
  name: "appPlateFormat",
  standalone: true,
})
export class PlateFormatPipe implements PipeTransform {
  transform(
    plate?: string | null,
    countryOrOptions?: PlateCountry | "AUTO" | FormatPlateOptions | null,
    isUnplated?: boolean
  ): string {
    void this;
    return formatPlate(plate, countryOrOptions, isUnplated);
  }
}
