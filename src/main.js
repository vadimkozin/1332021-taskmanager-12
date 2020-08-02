import {createSiteMenuTemplate} from './view/site-menu';
import {createFilterTemplate} from './view/filter';
import {createBoardTemplate} from './view/board';
import {createSortTemplate} from './view/sort';
import {createTaskTemplate} from './view/task';
import {createTaskEditTemplate} from './view/task-edit';
import {createLoadMoreButtonTemplate} from './view/load-more-button';

const TASK_COUNT = 3;

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
render(siteMainElement, createFilterTemplate());
render(siteMainElement, createBoardTemplate());

const boardElement = siteMainElement.querySelector(`.board`);
const taskListElement = boardElement.querySelector(`.board__tasks`);

render(boardElement, createSortTemplate(), Position.AFTER_BEGIN);
render(taskListElement, createTaskEditTemplate());

for (let i = 0; i < TASK_COUNT; i++) {
  render(taskListElement, createTaskTemplate());
}

render(boardElement, createLoadMoreButtonTemplate());
