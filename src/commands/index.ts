import  push from './push';
import  menu from './menu';

import { Context } from './../core/context';
import { Composer } from 'grammy';

const composer = new Composer<Context>();

composer.use(push);
composer.use(menu);

export default composer;