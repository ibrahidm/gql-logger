import Logger from './logger';
import emitter from './emitter';

const Log = () => {
  let logger: Logger;
  emitter.addListener('instanceRefreshed', (instance: Logger) => {
    logger = instance;
  });

  return (
    _target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const original: Function = descriptor.value;
    descriptor.value = async function (args: any) {
      const self = propertyKey;
      logger.start(self);

      let res;
      try {
        res = await original.call(this, args);
      } catch (e: any) {
        logger.error(self, e);
        throw e;
      }

      logger.end(self);
      return res;
    };
  };
};

export default Log;
