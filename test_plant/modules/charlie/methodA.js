/*
this message only for yentsun eyes only, and this is an JUNK branch so the rest is russian

мне не нравится предыдущий громоздкий вариант объявления модулей.
поэтому хочу предложить БЕЗ ОБОРАЧИВАНИЯ В КАЖДОМ ФАЙЛЕ метода, а только в Module.contructor

это первый вариант
но я подозреваю, что scope создавался как раз, чтобы plant & logger с толку не сбивали в объявлении метода
поэтому второй вариант в test_plant/modules/charlie/nonArrow.js с контекстом (но он тоже не идеален)

 */

module.exports = async (plant, logger, param1) => {
    const variable = plant.get('variable') || 17;

    if(typeof logger.info !== 'function') throw new Error('Logger inaccessible');
    if(!param1) throw new Error('You SHOULD see that exception. it\'s ok !!');

    return param1*variable
};