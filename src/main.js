import SiteMenuView from './view/site-menu.js';
import FilterView from './view/filter';
import TaskView from './view/task';
import TaskEditView from './view/task-edit';
import LoadMoreButtonView from './view/load-more-button';
import BoardView from './view/board';
import SortView from './view/sort';
import NoTaskView from './view/no-task';
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

render(siteHeaderElement, new SiteMenuView().getElement());

render(siteMainElement, new FilterView(filters).getElement());
render(siteMainElement, new BoardView().getElement());

const boardElement = siteMainElement.querySelector(`.board`);
const taskListElement = boardElement.querySelector(`.board__tasks`);

render(boardElement, new SortView().getElement(), RenderPosition.AFTER_BEGIN);
render(taskListElement, new TaskEditView().getElement(tasks[0]));

tasks
  .slice(1, Task.COUNT_PER_STEP)
  .forEach((task) => render(taskListElement, new TaskView(task).getElement()));


if (tasks.length > Task.COUNT_PER_STEP) {

  let count = Task.COUNT_PER_STEP;

  render(boardElement, new LoadMoreButtonView().getElement());

  const loadMoreElement = boardElement.querySelector(`.load-more`);

  const onClickLoadMoreButton = (evt) => {
    evt.preventDefault();

    tasks
      .slice(count, count + Task.COUNT_PER_STEP)
      .forEach((task) => render(taskListElement, new TaskView(task).getElement()));

    count += Task.COUNT_PER_STEP;

    if (count > tasks.length) {
      loadMoreElement.removeEventListener(`click`, onClickLoadMoreButton);
      loadMoreElement.remove();
    }

  };

  loadMoreElement.addEventListener(`click`, onClickLoadMoreButton);

}
