import {createSiteMenuTemplate} from './view/site-menu';
import {createFilterTemplate} from './view/filter';
import {createTaskTemplate} from './view/task';
import {createTaskEditTemplate} from './view/task-edit';
import {createLoadMoreButtonTemplate} from './view/load-more-button';
import {createBoardTemplate} from './view/board';
import {createSortTemplate} from './view/sort';
import {generateTask} from "./mock/task.js";
import {generateFilter} from "./mock/filter.js";

const Task = {
  COUNT: 33,
  COUNT_PER_STEP: 8,
};

const Position = {
  AFTER_BEGIN: `afterbegin`,
  BEFORE_END: `beforeend`,
};

const tasks = new Array(Task.COUNT).fill().map(generateTask);
const filters = generateFilter(tasks);

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
  .slice(1, Task.COUNT_PER_STEP)
  .forEach((task) => render(taskListElement, createTaskTemplate(task)));

if (tasks.length > Task.COUNT_PER_STEP) {

  let count = Task.COUNT_PER_STEP;

  render(boardElement, createLoadMoreButtonTemplate());

  const loadMoreElement = boardElement.querySelector(`.load-more`);

  const onClickLoadMoreButton = (evt) => {
    evt.preventDefault();

    tasks
      .slice(count, count + Task.COUNT_PER_STEP)
      .forEach((task) => render(taskListElement, createTaskTemplate(task)));

    count += Task.COUNT_PER_STEP;

    if (count > tasks.length) {
      loadMoreElement.removeEventListener(`click`, onClickLoadMoreButton);
      loadMoreElement.remove();
    }

  };

  loadMoreElement.addEventListener(`click`, onClickLoadMoreButton);

}
