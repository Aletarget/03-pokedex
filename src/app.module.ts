import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { envConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        load: [envConfiguration],
        validationSchema: JoiValidationSchema,
      }
    ),
    
    ServeStaticModule.forRoot({ 
      rootPath: join(__dirname,'..','Public'),    
    }),

    MongooseModule.forRoot(  process.env.MONGODB! , {
      dbName: 'pokemondb'
    } ),
    
    PokemonModule,
    
    CommonModule,
    
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(
  ){
    console.log( process.env.MONGODB ) 
  }

}
