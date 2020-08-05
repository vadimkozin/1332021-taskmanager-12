import {createSiteMenuTemplate} from './view/site-menu';
import {createFilterTemplate} from './view/filter';
import {createTaskTemplate} from './view/task';
import {createTaskEditTemplate} from './view/task-edit';
import {createLoadMoreButtonTemplate} from './view/load-more-button';
import {createBoardTemplate} from './view/board';
import {createSortTemplate} from './view/sort';
import {generateTask} from "./mock/task.js";
import {generateFilter} from "./mock/filter.js";

const TASK_COUNT = 33;
const TASK_COUNT_PER_STEP = 8;

const tasks = new Array(TASK_COUNT).fill().map(generateTask);
const filters = generateFilter(tasks);

const Position = {
  AFTER_BEGIN: `afterbegin`,
  BEFORE_END: `beforeend`,
};

const render = (container, template, position = Position.BEFORE_END) => {
  container.insertAdjacentHTML(position, template);
};

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

render(siteHeaderElement, createSiteMenuTemplate());
render(siteMainElement, createFilterTemplate(filters));
render(siteMainElement, createBoardTemplate());

const boardElement = siteMainElement.querySelector(`.board`);
const taskListElement = boardElement.querySelector(`.board__tasks`);

render(boardElement, createSortTemplate(), Position.AFTER_BEGIN);
render(taskListElement, createTaskEditTemplate(tasks[0]));

tasks
  .slice(1, TASK_COUNT_PER_STEP)
  .forEach((task) => render(taskListElement, createTaskTemplate(task)));

if (tasks.length > TASK_COUNT_PER_STEP) {

  let count = TASK_COUNT_PER_STEP;

  render(boardElement, createLoadMoreButtonTemplate());

  const loadMoreElement = boardElement.querySelector(`.load-more`);

  loadMoreElement.addEventListener(`click`, (evt) => {
    evt.preventDefault();

    tasks
      .slice(count, count + TASK_COUNT_PER_STEP)
      .forEach((task) => render(taskListElement, createTaskTemplate(task)));

    count += TASK_COUNT_PER_STEP;

    if (count > tasks.length) {
      loadMoreElement.remove();
    }

  });

}
