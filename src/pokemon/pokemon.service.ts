import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ){
    // console.log( process.env.DEFAULT_LIMIT ); //Aqui no obtenemos el valor
    // console.log(configService.getOrThrow('defaultLimit')); //Aqui el configSerivce tiene en cuenta la funcion de app.config.ts
    this.defaultLimit = configService.getOrThrow<number>('defaultLimit');
  }
  


  
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async createMany(createPokemonDto: CreatePokemonDto[]){

      createPokemonDto.forEach(createPokemonDto => {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
    });
    try {
      await this.pokemonModel.insertMany(createPokemonDto)
    } catch (error) {
      console.log(error)
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
 
    const {limit = this.defaultLimit, offset=0} = paginationDto;
    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
    .sort({
      no: 1, //1 para ordenar de namera ascendente y -1 para ordenar de manera descendente
    })
    .select('-__v')
  }

  async findOne(term: string) {
    let pokemon: Pokemon|null = null; //Se crea una variable de tipo igual a la entidad Pokemon para no tener problemas con la db
    if(!isNaN(+term) ){
      pokemon = await this.pokemonModel.findOne({no:term});
    }

    //MongoID

    if(isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }
    //Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:term.toLowerCase().trim()});
    }
    //Not found
    if(!pokemon) 
      throw new NotFoundException (`Pokemon with id, name or no "${term}" not found`)
    return pokemon;
  }



  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    try {
      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      await pokemon.updateOne(updatePokemonDto)
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {

    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne();

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if (deletedCount === 0 ){
      throw new BadRequestException(`Pokemon with id "${id}" was not found`);
    }
    return;
  }


  private handleExceptions(error: any){
    if(error.code === 11000){
        throw new BadRequestException(`Pokemon was in db: ${JSON.stringify(error.keyValue)}`);
      }
      else {
        throw new InternalServerErrorException(`Error to try update a pokemon, review the logs`)
      }
  }
}
