/*
this message only for yentsun eyes only, and this is an JUNK branch so the rest is russian

мне не нравится предыдущий громоздкий вариант объявления модулей.
поэтому хочу предложить БЕЗ ОБОРАЧИВАНИЯ В КАЖДОМ ФАЙЛЕ метода, а только в Module.contructor

это второй вариант, передавать plant & logger в this. см. ниже.
первый в test_plant/modules/charlie/methodA.js

НО в этом варианте объявления в методах должны быть традиционными
НИКАКИХ ARROW FUNCTION. в них беда с контекстом (this)

ну и можно оставить текущий вариант. просто переписать его без callback

 */

module.exports = async function (param1) {
    const {plant, logger} = this;

    const variable = plant && plant.get('variable') ? plant.get('variable') : 17;

    if(typeof logger.info !== 'function') throw new Error('Logger inaccessible');
    if(!param1) throw new Error('You SHOULD see that exception. it\'s ok !!');

    return await plant.module('charlie').methodA(param1);
};