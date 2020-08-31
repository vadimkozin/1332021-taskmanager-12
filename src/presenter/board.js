import BoardView from "../view/board.js";
import SortView from "../view/sort.js";
import TaskListView from "../view/task-list.js";
import NoTaskView from "../view/no-task.js";
import LoadMoreButtonView from "../view/load-more-button.js";
import TaskPresenter from "./task.js";
import {updateItem} from "../utils/common.js";
import {render, RenderPosition, remove} from "../utils/render.js";
import {sortTaskUp, sortTaskDown} from "../utils/task.js";
import {SortType} from "../const.js";

const TASK_COUNT_PER_STEP = 8;

export default class Board {
  constructor(boardContainer, tasksModel) {
    this._tasksModel = tasksModel;
    this._boardContainer = boardContainer;
    this._renderedTaskCount = TASK_COUNT_PER_STEP;
    this._currenSortType = SortType.DEFAULT;
    this._taskPresenter = {};

    this._boardComponent = new BoardView();
    this._sortComponent = new SortView();
    this._taskListComponent = new TaskListView();
    this._noTaskComponent = new NoTaskView();
    this._loadMoreButtonComponent = new LoadMoreButtonView();

    this._setHandlers();
  }

  _setHandlers() {
    this._handlers = {};

    this._handlers.taskChange = (updatedTask) => {
      this._boardTasks = updateItem(this._boardTasks, updatedTask);
      this._sourcedBoardTasks = updateItem(this._sourcedBoardTasks, updatedTask);
      this._taskPresenter[updatedTask.id].init(updatedTask);
    };

    this._handlers.modeChange = () => {
      Object
        .values(this._taskPresenter)
        .forEach((presenter) => presenter.resetView());
    };

    this._handlers.sortTypeChange = (sortType) => {
      if (this._currenSortType === sortType) {
        return;
      }

      this._sortTasks(sortType);
      this._clearTaskList();
      this._renderTaskList();
    };

    this._handlers.loadMoreButtonClick = () => {
      this._renderTasks(this._renderedTaskCount, this._renderedTaskCount + TASK_COUNT_PER_STEP);
      this._renderedTaskCount += TASK_COUNT_PER_STEP;

      if (this._renderedTaskCount >= this._boardTasks.length) {
        this._loadMoreButtonComponent.removeClickHandler();
        remove(this._loadMoreButtonComponent);
      }
    };

    this._handlers.taskChange = this._handlers.taskChange.bind(this);
    this._handlers.modeChange = this._handlers.modeChange.bind(this);
    this._handlers.sortTypeChange = this._handlers.sortTypeChange.bind(this);
    this._handlers.loadMoreButtonClick = this._handlers.loadMoreButtonClick.bind(this);
  }

  init(boardTasks) {
    this._boardTasks = boardTasks.slice();
    this._sourcedBoardTasks = boardTasks.slice();

    render(this._boardContainer, this._boardComponent);
    render(this._boardComponent, this._taskListComponent);

    this._renderBoard();
  }

  _getTasks() {
    return this._tasksModel.getTasks();
  }

  _sortTasks(sortType) {
    switch (sortType) {
      case SortType.DATE_UP:
        this._boardTasks.sort(sortTaskUp);
        break;
      case SortType.DATE_DOWN:
        this._boardTasks.sort(sortTaskDown);
        break;
      default:
        this._boardTasks = this._sourcedBoardTasks.slice();
    }

    this._currenSortType = sortType;
  }

  _renderSort() {
    render(this._boardComponent, this._sortComponent, RenderPosition.AFTER_BEGIN);
    this._sortComponent.setSortTypeChangeHandler(this._handlers.sortTypeChange);
  }

  _renderTask(task) {
    const taskPresenter = new TaskPresenter(this._taskListComponent, this._handlers.taskChange, this._handlers.modeChange);

    taskPresenter.init(task);
    this._taskPresenter[task.id] = taskPresenter;
  }

  _renderTasks(from, to) {
    this._boardTasks
      .slice(from, to)
      .forEach((boardTask) => this._renderTask(boardTask));
  }

  _renderNoTasks() {
    render(this._boardComponent, this._noTaskComponent, RenderPosition.AFTER_BEGIN);
  }

  _renderLoadMoreButton() {
    render(this._boardComponent, this._loadMoreButtonComponent);
    this._loadMoreButtonComponent.setClickHandler(this._handlers.loadMoreButtonClick);
  }

  _clearTaskList() {
    Object
      .values(this._taskPresenter)
      .forEach((presenter) => presenter.destroy());
    this._taskPresenter = {};
    this._renderedTaskCount = TASK_COUNT_PER_STEP;
  }

  _renderTaskList() {
    this._renderTasks(0, Math.min(this._boardTasks.length, TASK_COUNT_PER_STEP));

    if (this._boardTasks.length > TASK_COUNT_PER_STEP) {
      this._renderLoadMoreButton();
    }
  }

  _renderBoard() {
    if (this._boardTasks.every((task) => task.isArchive)) {
      this._renderNoTasks();
      return;
    }

    this._renderSort();
    this._renderTaskList();
  }
}
