import FilterView from "../view/filter.js";
import {render, replace, remove} from "../utils/render.js";
import {filter} from "../utils/filter.js";
import {FilterType, UpdateType} from "../const.js";

export default class Filter {
  constructor(container, filterModel, tasksModel) {
    this._container = container;
    this._filterModel = filterModel;
    this._tasksModel = tasksModel;
    this._currentFilter = null;

    this._component = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleFilterTypeChange = this._handleFilterTypeChange.bind(this);

    this._tasksModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
  }

  init() {
    this._currentFilter = this._filterModel.getFilter();

    const filters = this._filters;
    const prevFilterComponent = this._component;

    this._component = new FilterView(filters, this._currentFilter);
    this._component.setFilterTypeChangeHandler(this._handleFilterTypeChange);

    if (prevFilterComponent === null) {
      render(this._container, this._component);
      return;
    }

    replace(this._component, prevFilterComponent);
    remove(prevFilterComponent);
  }

  _handleModelEvent() {
    this.init();
  }

  _handleFilterTypeChange(filterType) {
    if (this._currentFilter === filterType) {
      return;
    }

    this._filterModel.setFilter(UpdateType.MAJOR, filterType);
  }

  get _filters() {
    const tasks = this._tasksModel.tasks;

    return Object.keys(FilterType).map((type) =>
      ({
        type: FilterType[type],
        name: FilterType[type],
        count: filter[FilterType[type]](tasks).length
      })
    );
  }
}
