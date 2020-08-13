import SiteMenuView from './view/site-menu.js';
import FilterView from './view/filter';
import TaskView from './view/task';
import TaskEditView from './view/task-edit';
import LoadMoreButtonView from './view/load-more-button';
import BoardView from './view/board';
import SortView from './view/sort';
import {generateTask} from "./mock/task.js";
import {generateFilter} from "./mock/filter.js";
import {render, RenderPosition} from './utils';

const Task = {
  COUNT: 33,
  COUNT_PER_STEP: 8,
};

const tasks = new Array(Task.COUNT).fill().map(generateTask);
const filters = generateFilter(tasks);

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

const renderTask = (taskListElement, task) => {
  const taskComponent = new TaskView(task);
  const taskEditComponent = new TaskEditView(task);

  const replaceCardToForm = () => {
    taskListElement.replaceChild(taskEditComponent.getElement(), taskComponent.getElement());
  };

  const replaceFormToCard = () => {
    taskListElement.replaceChild(taskComponent.getElement(), taskEditComponent.getElement());
  };

  const onEscKeyDown = (evt) => {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      evt.preventDefault();
      replaceFormToCard();
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };

  taskComponent.getElement().querySelector(`.card__btn--edit`).addEventListener(`click`, () => {
    replaceCardToForm();
    document.addEventListener(`keydown`, onEscKeyDown);
  });

  taskEditComponent.getElement().querySelector(`form`).addEventListener(`submit`, (evt) => {
    evt.preventDefault();
    replaceFormToCard();
    document.removeEventListener(`keydown`, onEscKeyDown);
  });

  render(taskListElement, taskComponent.getElement());
};

render(siteHeaderElement, new SiteMenuView().getElement());
render(siteMainElement, new FilterView(filters).getElement());
render(siteMainElement, new BoardView().getElement());

const boardElement = siteMainElement.querySelector(`.board`);
const taskListElement = boardElement.querySelector(`.board__tasks`);

render(boardElement, new SortView().getElement(), RenderPosition.AFTER_BEGIN);

tasks
  .slice(0, Math.min(tasks.length, Task.COUNT_PER_STEP))
  .forEach((task) => renderTask(taskListElement, task));

if (tasks.length > Task.COUNT_PER_STEP) {

  let count = Task.COUNT_PER_STEP;

  render(boardElement, new LoadMoreButtonView().getElement());

  const loadMoreElement = boardElement.querySelector(`.load-more`);

  const onClickLoadMoreButton = (evt) => {
    evt.preventDefault();

    tasks
      .slice(count, count + Task.COUNT_PER_STEP)
      .forEach((task) => renderTask(taskListElement, task));

    count += Task.COUNT_PER_STEP;

    if (count > tasks.length) {
      loadMoreElement.removeEventListener(`click`, onClickLoadMoreButton);
      loadMoreElement.remove();
    }

  };

  loadMoreElement.addEventListener(`click`, onClickLoadMoreButton);

}
