import Logger from './logger';
import emitter from './emitter';

const Log = () => {
  let logger: Logger;
  emitter.addListener('instanceRefreshed', (instance: Logger) => {
    logger = instance;
  });

  return (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const original = descriptor.value;
    descriptor.value = async (args: any) => {
      const self = propertyKey;
      logger.start(self);

      let res;
      try {
        res = await original({ ...args });
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
