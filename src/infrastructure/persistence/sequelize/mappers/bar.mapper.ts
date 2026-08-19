import { Bar } from "../../../../domain/entities/Bar.entities";



export function toBarEntity(row: any): Bar {
  return new Bar(row.id, row.address, row.name, row.latitude, row.longitude)
}