import SiteMenuView from "./view/site-menu.js";
import FilterView from "./view/filter.js";
import {generateTask} from "./mock/task.js";
import {generateFilter} from "./mock/filter.js";
import BoardPresenter from "./presenter/board.js";
import {render} from "./utils/render.js";

const TASK_COUNT = 25;

const tasks = new Array(TASK_COUNT).fill().map(generateTask);
const filters = generateFilter(tasks);

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

const boardPresenter = new BoardPresenter(siteMainElement);

render(siteHeaderElement, new SiteMenuView());
render(siteMainElement, new FilterView(filters));

boardPresenter.init(tasks);
