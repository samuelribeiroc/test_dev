import 'dotenv/config';
import debug from 'debug';

const logger = debug('core');

const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);
const load = delays.map(
    (delay) => (): Promise<number> =>
        new Promise((resolve) => {
            setTimeout(() => resolve(Math.floor(delay / 100)), delay);
        }),
);

type Task = () => Promise<number>;

async function processTask(queue: Task[], results: number[]): Promise<void> {
    while (queue.length > 0) {
        const task = queue.shift()!;
        const result = await task();
        results.push(result);
    };
};

const throttle = async (workers: number, tasks: Task[]) => {
    const queue: Task[] = [...tasks];
    const results: number[] = [];
    const workersPromises = Array.from({ length: workers }).map(() => processTask(queue, results));

    await Promise.all(workersPromises);
    return results;
};

const bootstrap = async () => {
  logger('Starting...');
  const start = Date.now();
  const answers = await throttle(5, load);
  logger('Done in %dms', Date.now() - start);
  logger('Answers: %O', answers);
};

bootstrap().catch((err) => {
  logger('General fail: %O', err);
});
