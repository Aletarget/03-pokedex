import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './Interfaces/Poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';

@Injectable()
export class SeedService {
  constructor(
      private readonly pokemonService: PokemonService
    ){}
  private readonly axios: AxiosInstance = axios;
  
  async executeSeed(){

    
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    data.results.forEach(({name, url}) => {

      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      this.pokemonService.create({name, no})
      console.log({name, no});
    })


    return data.results[0].url;

  }
}
