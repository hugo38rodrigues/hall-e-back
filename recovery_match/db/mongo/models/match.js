import mongoose from 'mongoose'

export const matchSchema = new mongoose.Schema({
  idMatch: Number,
  date: Date,
  team1: String,
  team2: String,
  game: String,
  league: String
})

