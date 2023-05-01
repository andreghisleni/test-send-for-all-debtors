import { env } from '@env';

import { server } from './app';

server.listen(env.PORT, () => {
  console.log('🚀 Server started on port 3333!');
});
