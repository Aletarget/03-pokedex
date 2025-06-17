import { Injectable } from '@nestjs/common';
import { PokeResponse } from './Interfaces/Poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
      @InjectModel(Pokemon.name)
      private readonly pokemonModel: Model<Pokemon>,
      private readonly pokemonService: PokemonService,
      private readonly http: AxiosAdapter
    ){}
  
  async bulk(){

    //Inicializamos desde 0 la base de datos
    await this.pokemonModel.deleteMany();

    const data= await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    const pokemons: CreatePokemonDto[] = [];
    data.results.forEach(({name, url}) => {

      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      pokemons.push({name,no});
    })
    
    this.pokemonService.createMany(pokemons)
  }
}
