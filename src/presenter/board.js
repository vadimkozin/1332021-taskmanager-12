import BoardView from "../view/board.js";
import SortView from "../view/sort.js";
import TaskListView from "../view/task-list.js";
import NoTaskView from "../view/no-task.js";
import LoadMoreButtonView from "../view/load-more-button.js";
import TaskPresenter from "./task.js";
import TaskNewPresenter from "./task-new.js";
import {render, RenderPosition, remove} from "../utils/render.js";
import {sortTaskUp, sortTaskDown} from "../utils/task.js";
import {filter} from "../utils/filter";
import {SortType, UpdateType, UserAction} from "../const.js";

const TASK_COUNT_PER_STEP = 8;

export default class Board {
  constructor(boardContainer, tasksModel, filterModel) {
    this._tasksModel = tasksModel;
    this._filterModel = filterModel;
    this._boardContainer = boardContainer;
    this._renderedTaskCount = TASK_COUNT_PER_STEP;
    this._currenSortType = SortType.DEFAULT;
    this._taskPresenter = {};

    this._sortComponent = null;
    this._loadMoreButtonComponent = null;

    this._boardComponent = new BoardView();
    this._taskListComponent = new TaskListView();
    this._noTaskComponent = new NoTaskView();

    this._setHandlers();

    this._taskNewPresenter = new TaskNewPresenter(this._taskListComponent, this._handleViewAction);
  }

  _setHandlers() {
    this._handlers = {};

    this._handlers.modeChange = () => {
      this._taskNewPresenter.destroy();
      Object
        .values(this._taskPresenter)
        .forEach((presenter) => presenter.resetView());
    };

    this._handlers.viewAction = (actionType, updateType, update) => {
      switch (actionType) {
        case UserAction.UPDATE_TASK:
          this._tasksModel.updateTask(updateType, update);
          break;
        case UserAction.ADD_TASK:
          this._tasksModel.addTask(updateType, update);
          break;
        case UserAction.DELETE_TASK:
          this._tasksModel.deleteTask(updateType, update);
          break;
      }
    };

    this._handlers.modelEvent = (updateType, data) => {
      switch (updateType) {
        case UpdateType.PATCH:
          this._taskPresenter[data.id].init(data);
          break;
        case UpdateType.MINOR:
          this._clearBoard();
          this._renderBoard();
          break;
        case UpdateType.MAJOR:
          this._clearBoard({resetRenderedTaskCount: true, resetSortType: true});
          this._renderBoard();
          break;
      }
    };

    this._handlers.sortTypeChange = (sortType) => {
      if (this._currenSortType === sortType) {
        return;
      }

      this._currentSortType = sortType;
      this._clearBoard({resetRenderedTaskCount: true});
      this._renderBoard();
    };

    this._handlers.loadMoreButtonClick = () => {
      const taskCount = this._getTasks().length;
      const newRenderedTaskCount = Math.min(taskCount, this._renderedTaskCount + TASK_COUNT_PER_STEP);
      const tasks = this._getTasks().slice(this._renderedTaskCount, newRenderedTaskCount);

      this._renderTasks(tasks);
      this._renderedTaskCount = newRenderedTaskCount;

      if (this._renderedTaskCount >= taskCount) {
        remove(this._loadMoreButtonComponent);
      }
    };

    this._handlers.sortTypeChange = (sortType) => {
      if (this._currentSortType === sortType) {
        return;
      }

      this._currentSortType = sortType;
      this._clearBoard({resetRenderedTaskCount: true});
      this._renderBoard();
    };

    this._handlers.viewAction = this._handlers.viewAction.bind(this);
    this._handlers.modelEvent = this._handlers.modelEvent.bind(this);
    this._handlers.modeChange = this._handlers.modeChange.bind(this);
    this._handlers.loadMoreButtonClick = this._handlers.loadMoreButtonClick.bind(this);
    this._handlers.sortTypeChange = this._handlers.sortTypeChange.bind(this);

  }

  init() {
    render(this._boardContainer, this._boardComponent);
    render(this._boardComponent, this._taskListComponent);

    this._tasksModel.addObserver(this._handlers.modelEvent);
    this._filterModel.addObserver(this._handlers.modelEvent);

    this._renderBoard();
  }

  destroy() {
    this._clearBoard({resetRenderedTaskCount: true, resetSortType: true});

    remove(this._taskListComponent);
    remove(this._boardComponent);

    this._tasksModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);
  }

  createTask(callback) {
    this._taskNewPresenter.init(callback);
  }

  _getTasks() {
    const filterType = this._filterModel.getFilter();
    const tasks = this._tasksModel.getTasks();
    const filtredTasks = filter[filterType](tasks);

    switch (this._currentSortType) {
      case SortType.DATE_UP:
        return filtredTasks.sort(sortTaskUp);
      case SortType.DATE_DOWN:
        return filtredTasks.sort(sortTaskDown);
    }

    return filtredTasks;
  }

  _renderSort() {
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._sortComponent = new SortView(this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handlers.sortTypeChange);

    render(this._boardComponent, this._sortComponent, RenderPosition.AFTER_BEGIN);
  }

  _renderTask(task) {
    const taskPresenter = new TaskPresenter(this._taskListComponent, this._handlers.viewAction, this._handlers.modeChange);
    taskPresenter.init(task);
    this._taskPresenter[task.id] = taskPresenter;
  }

  _renderTasks(tasks) {
    tasks.forEach((task) => this._renderTask(task));
  }

  _renderNoTasks() {
    render(this._boardComponent, this._noTaskComponent, RenderPosition.AFTER_BEGIN);
  }

  _renderLoadMoreButton() {
    if (this._loadMoreButtonComponent !== null) {
      this._loadMoreButtonComponent = null;
    }

    this._loadMoreButtonComponent = new LoadMoreButtonView();
    this._loadMoreButtonComponent.setClickHandler(this._handlers.loadMoreButtonClick);

    render(this._boardComponent, this._loadMoreButtonComponent);
  }

  _clearBoard({resetRenderedTaskCount = false, resetSortType = false} = {}) {
    const taskCount = this._getTasks().length;

    this._taskNewPresenter.destroy();
    Object
      .values(this._taskPresenter)
      .forEach((presenter) => presenter.destroy());
    this._taskPresenter = {};

    remove(this._sortComponent);
    remove(this._noTaskComponent);
    if (this._loadMoreButtonComponent) {
      remove(this._loadMoreButtonComponent);
    }

    if (resetRenderedTaskCount) {
      this._renderedTaskCount = TASK_COUNT_PER_STEP;
    } else {
      this._renderedTaskCount = Math.min(taskCount, this._renderedTaskCount);
    }

    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }
  }

  _renderBoard() {
    const tasks = this._getTasks();
    const taskCount = tasks.length;

    if (taskCount === 0) {
      this._renderNoTasks();
      return;
    }

    this._renderSort();
    this._renderTasks(tasks.slice(0, Math.min(taskCount, this._renderedTaskCount)));

    if (taskCount > this._renderedTaskCount) {
      this._renderLoadMoreButton();
    }
  }

}
