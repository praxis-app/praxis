import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { ImagesService } from './images.service';
import { Image } from './models/image.model';

@Resolver(() => Image)
export class ImagesResolver {
  constructor(private service: ImagesService) {}

  @Mutation(() => Boolean)
  async deleteImage(@Args('id', { type: () => Int }) id: number) {
    return this.service.deleteImage({ id });
  }
}
