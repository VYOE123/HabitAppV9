import React, { useState } from 'react'
import Layout from '../../components/Layout'
import { useFeatures } from '../../contexts/FeaturesContext'

export default function MealTrackerApp() {
  const { 
    getMealLogs, 
    addMealLog, 
    updateMealLog,
    deleteMealLog,
    updateWaterIntake, 
    getWaterIntake,
    getMealStreak,
    getWaterStreak,
    updateMealTrackerSettings,
    getMealTrackerSettings
  } = useFeatures()

  const [activeTab, setActiveTab] = useState('today') // 'today', 'history', 'goals'
  const [showAddMealModal, setShowAddMealModal] = useState(false)
  const [showEditMealModal, setShowEditMealModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [deletingMeal, setDeletingMeal] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [mealForm, setMealForm] = useState({
    type: 'breakfast',
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const [todayMeals, setTodayMeals] = useState(getMealLogs(today))
  const todayWater = getWaterIntake(today)
  const settings = getMealTrackerSettings()
  const waterGoal = settings.waterGoal || 8
  const mealStreak = getMealStreak()
  const waterStreak = getWaterStreak()

  // Move tempSettings state to top level to avoid conditional hook calls
  const [tempSettings, setTempSettings] = useState(settings)

  const mealTypes = {
    breakfast: { label: 'Breakfast', icon: '🌅', color: '#ffeaa7' },
    lunch: { label: 'Lunch', icon: '☀️', color: '#fab1a0' },
    dinner: { label: 'Dinner', icon: '🌙', color: '#fd79a8' },
    snack: { label: 'Snack', icon: '🍎', color: '#a29bfe' }
  }

  // Update local state when meals change
  React.useEffect(() => {
    setTodayMeals(getMealLogs(today))
  }, [getMealLogs, today])

  // Update tempSettings when settings change
  React.useEffect(() => {
    setTempSettings(settings)
  }, [settings])

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessMessage(true)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  const handleAddMeal = () => {
    setMealForm({
      type: 'breakfast',
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: ''
    })
    setEditingMeal(null)
    setShowAddMealModal(true)
  }

  const handleEditMeal = (meal) => {
    setMealForm({
      type: meal.type,
      name: meal.name,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      notes: meal.notes || ''
    })
    setEditingMeal(meal)
    setShowEditMealModal(true)
  }

  const handleSaveMeal = () => {
    if (!mealForm.name.trim()) {
      alert('Please enter a meal name')
      return
    }

    const mealData = {
      type: mealForm.type,
      name: mealForm.name.trim(),
      calories: parseInt(mealForm.calories) || 0,
      protein: parseInt(mealForm.protein) || 0,
      carbs: parseInt(mealForm.carbs) || 0,
      fat: parseInt(mealForm.fat) || 0,
      notes: mealForm.notes.trim()
    }

    if (editingMeal) {
      // Update existing meal
      updateMealLog(today, editingMeal.id, mealData)
      setShowEditMealModal(false)
      showSuccess('Meal updated successfully!')
    } else {
      // Add new meal
      addMealLog(today, mealData)
      setShowAddMealModal(false)
      showSuccess('Meal added successfully!')
    }

    // Reset form
    setMealForm({
      type: 'breakfast',
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: ''
    })
    setEditingMeal(null)
  }

  const handleDeleteMeal = (meal) => {
    setDeletingMeal(meal)
    setShowDeleteModal(true)
  }

  const confirmDeleteMeal = () => {
    if (deletingMeal) {
      deleteMealLog(today, deletingMeal.id)
      setShowDeleteModal(false)
      setDeletingMeal(null)
      showSuccess('Meal deleted successfully!')
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeletingMeal(null)
  }

  const handleWaterIncrement = () => {
    updateWaterIntake(today, todayWater + 1)
  }

  const handleWaterDecrement = () => {
    if (todayWater > 0) {
      updateWaterIntake(today, todayWater - 1)
    }
  }

  const handleUpdateSettings = (newSettings) => {
    updateMealTrackerSettings(newSettings)
  }

  const getWaterProgress = () => {
    return Math.min((todayWater / waterGoal) * 100, 100)
  }

  const getTotalNutrition = () => {
    const currentMeals = getMealLogs(today)
    return currentMeals.reduce((total, meal) => ({
      calories: total.calories + (meal.calories || 0),
      protein: total.protein + (meal.protein || 0),
      carbs: total.carbs + (meal.carbs || 0),
      fat: total.fat + (meal.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const getMealsForType = (type) => {
    const currentMeals = getMealLogs(today)
    return currentMeals.filter(meal => meal.type === type)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const renderTodayView = () => {
    const totalNutrition = getTotalNutrition()
    const waterProgress = getWaterProgress()

    return (
      <div className="meal-tracker-today">
        {/* Water Tracking */}
        <div className="water-section">
          <div className="section-header">
            <h3>💧 Water Intake</h3>
            <div className="streak-badge">🔥 {waterStreak} days</div>
          </div>
          
          <div className="water-tracker">
            <div className="water-progress-container">
              <div className="water-bottle">
                <div 
                  className="water-fill" 
                  style={{ height: `${waterProgress}%` }}
                />
                <div className="water-text">
                  {todayWater}/{waterGoal}
                </div>
              </div>
              <div className="water-controls">
                <button 
                  className="water-btn decrement"
                  onClick={handleWaterDecrement}
                  disabled={todayWater === 0}
                >
                  -
                </button>
                <span className="water-count">{todayWater} glasses</span>
                <button 
                  className="water-btn increment"
                  onClick={handleWaterIncrement}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="nutrition-summary">
          <h3>📊 Today's Nutrition</h3>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <div className="nutrition-value">{totalNutrition.calories}</div>
              <div className="nutrition-label">Calories</div>
              {settings.calorieGoal && (
                <div className="nutrition-goal">Goal: {settings.calorieGoal}</div>
              )}
            </div>
            <div className="nutrition-item">
              <div className="nutrition-value">{totalNutrition.protein}g</div>
              <div className="nutrition-label">Protein</div>
              {settings.proteinGoal && (
                <div className="nutrition-goal">Goal: {settings.proteinGoal}g</div>
              )}
            </div>
            <div className="nutrition-item">
              <div className="nutrition-value">{totalNutrition.carbs}g</div>
              <div className="nutrition-label">Carbs</div>
              {settings.carbsGoal && (
                <div className="nutrition-goal">Goal: {settings.carbsGoal}g</div>
              )}
            </div>
            <div className="nutrition-item">
              <div className="nutrition-value">{totalNutrition.fat}g</div>
              <div className="nutrition-label">Fat</div>
              {settings.fatGoal && (
                <div className="nutrition-goal">Goal: {settings.fatGoal}g</div>
              )}
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="meals-section">
          <div className="section-header">
            <h3>🍽️ Meals</h3>
            <div className="streak-badge">🔥 {mealStreak} days</div>
          </div>
          
          <button className="add-meal-btn" onClick={handleAddMeal}>
            + Add Meal
          </button>

          <div className="meals-list">
            {Object.entries(mealTypes).map(([type, config]) => {
              const meals = getMealsForType(type)
              
              return (
                <div key={type} className="meal-type-section">
                  <div className="meal-type-header">
                    <span className="meal-icon">{config.icon}</span>
                    <span className="meal-type-name">{config.label}</span>
                    <span className="meal-count">({meals.length})</span>
                  </div>
                  
                  {meals.length === 0 ? (
                    <div className="no-meals">No {config.label.toLowerCase()} logged</div>
                  ) : (
                    <div className="meal-items">
                      {meals.map((meal, index) => (
                        <div key={meal.id} className="meal-item">
                          <div className="meal-info">
                            <div className="meal-name">{meal.name}</div>
                            <div className="meal-time">{formatTime(meal.timestamp)}</div>
                            {meal.calories > 0 && (
                              <div className="meal-calories">{meal.calories} cal</div>
                            )}
                          </div>
                          {meal.notes && (
                            <div className="meal-notes">{meal.notes}</div>
                          )}
                          <div className="meal-actions">
                            <button 
                              className="edit-meal-btn"
                              onClick={() => handleEditMeal(meal)}
                              title="Edit meal"
                            >
                              ✏️
                            </button>
                            <button 
                              className="delete-meal-btn"
                              onClick={() => handleDeleteMeal(meal)}
                              title="Delete meal"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderHistoryView = () => {
    const historyDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    })

    return (
      <div className="meal-tracker-history">
        <h3>📈 Weekly History</h3>
        
        <div className="history-list">
          {historyDates.map(date => {
            const meals = getMealLogs(date)
            const water = getWaterIntake(date)
            const dateObj = new Date(date)
            const isToday = date === today
            
            // Calculate nutrition totals for this date
            const dayNutrition = meals.reduce((total, meal) => ({
              calories: total.calories + (meal.calories || 0),
              protein: total.protein + (meal.protein || 0),
              carbs: total.carbs + (meal.carbs || 0),
              fat: total.fat + (meal.fat || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
            
            return (
              <div key={date} className="history-day">
                <div className="history-date">
                  <div className="date-label">
                    {isToday ? 'Today' : dateObj.toLocaleDateString('en', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div className="history-details">
                  <div className="history-stats">
                    <div className="history-stat">
                      <span className="stat-icon">🍽️</span>
                      <span className="stat-value">{meals.length} meals</span>
                    </div>
                    <div className="history-stat">
                      <span className="stat-icon">💧</span>
                      <span className="stat-value">{water}/{waterGoal} glasses</span>
                    </div>
                  </div>
                  
                  <div className="nutrition-summary-small">
                    <div className="nutrition-item-small">
                      <span className="nutrition-value-small">{dayNutrition.calories}</span>
                      <span className="nutrition-label-small">cal</span>
                      {settings.calorieGoal && (
                        <span className="goal-vs-actual">
                          / {settings.calorieGoal}
                        </span>
                      )}
                    </div>
                    <div className="nutrition-item-small">
                      <span className="nutrition-value-small">{dayNutrition.protein}g</span>
                      <span className="nutrition-label-small">protein</span>
                      {settings.proteinGoal && (
                        <span className="goal-vs-actual">
                          / {settings.proteinGoal}g
                        </span>
                      )}
                    </div>
                    <div className="nutrition-item-small">
                      <span className="nutrition-value-small">{dayNutrition.carbs}g</span>
                      <span className="nutrition-label-small">carbs</span>
                      {settings.carbsGoal && (
                        <span className="goal-vs-actual">
                          / {settings.carbsGoal}g
                        </span>
                      )}
                    </div>
                    <div className="nutrition-item-small">
                      <span className="nutrition-value-small">{dayNutrition.fat}g</span>
                      <span className="nutrition-label-small">fat</span>
                      {settings.fatGoal && (
                        <span className="goal-vs-actual">
                          / {settings.fatGoal}g
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderGoalsView = () => {
    const handleSaveSettings = () => {
      handleUpdateSettings(tempSettings)
      showSuccess('Goals saved successfully!')
    }

    return (
      <div className="meal-tracker-goals">
        <h3>🎯 Daily Goals</h3>
        
        <div className="goals-form">
          <div className="goals-section">
            <h4>💧 Hydration Goals</h4>
            <div className="setting-group">
              <label htmlFor="waterGoal">Daily Water Goal (glasses)</label>
              <input
                type="number"
                id="waterGoal"
                value={tempSettings.waterGoal || 8}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  waterGoal: parseInt(e.target.value) || 8
                })}
                min="1"
                max="20"
              />
            </div>
          </div>

          <div className="goals-section">
            <h4>🍽️ Nutrition Goals</h4>
            <div className="nutrition-goals-grid">
              <div className="setting-group">
                <label htmlFor="calorieGoal">Daily Calories</label>
                <input
                  type="number"
                  id="calorieGoal"
                  value={tempSettings.calorieGoal || ''}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    calorieGoal: parseInt(e.target.value) || 0
                  })}
                  placeholder="e.g., 2000"
                />
              </div>
              
              <div className="setting-group">
                <label htmlFor="proteinGoal">Daily Protein (g)</label>
                <input
                  type="number"
                  id="proteinGoal"
                  value={tempSettings.proteinGoal || ''}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    proteinGoal: parseInt(e.target.value) || 0
                  })}
                  placeholder="e.g., 150"
                />
              </div>
              
              <div className="setting-group">
                <label htmlFor="carbsGoal">Daily Carbs (g)</label>
                <input
                  type="number"
                  id="carbsGoal"
                  value={tempSettings.carbsGoal || ''}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    carbsGoal: parseInt(e.target.value) || 0
                  })}
                  placeholder="e.g., 250"
                />
              </div>
              
              <div className="setting-group">
                <label htmlFor="fatGoal">Daily Fat (g)</label>
                <input
                  type="number"
                  id="fatGoal"
                  value={tempSettings.fatGoal || ''}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    fatGoal: parseInt(e.target.value) || 0
                  })}
                  placeholder="e.g., 65"
                />
              </div>
            </div>
          </div>
          
          <button className="save-goals-btn" onClick={handleSaveSettings}>
            💾 Save Goals
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout title="🍱 Meal & Water Tracker" showBackButton={true} backTo="/features">
      <div className="meal-tracker-content">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="success-toast">
            <div className="success-toast-content">
              <span className="success-icon">✅</span>
              <span className="success-text">{successMessage}</span>
            </div>
          </div>
        )}

        <div className="meal-tracker-tabs">
          <button 
            className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            Today
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            Goals
          </button>
        </div>

        {activeTab === 'today' && renderTodayView()}
        {activeTab === 'history' && renderHistoryView()}
        {activeTab === 'goals' && renderGoalsView()}

        {/* Add Meal Modal */}
        {showAddMealModal && (
          <div className="modal-overlay" onClick={() => setShowAddMealModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Meal</h3>
                <button className="modal-close" onClick={() => setShowAddMealModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="meal-form">
                  <div className="form-group">
                    <label htmlFor="mealType">Meal Type</label>
                    <select
                      id="mealType"
                      value={mealForm.type}
                      onChange={(e) => setMealForm({ ...mealForm, type: e.target.value })}
                    >
                      {Object.entries(mealTypes).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="mealName">Meal Name</label>
                    <input
                      type="text"
                      id="mealName"
                      value={mealForm.name}
                      onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                      placeholder="e.g., Grilled chicken salad"
                      required
                    />
                  </div>
                  
                  <div className="nutrition-inputs">
                    <div className="form-group">
                      <label htmlFor="calories">Calories</label>
                      <input
                        type="number"
                        id="calories"
                        value={mealForm.calories}
                        onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="protein">Protein (g)</label>
                      <input
                        type="number"
                        id="protein"
                        value={mealForm.protein}
                        onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="carbs">Carbs (g)</label>
                      <input
                        type="number"
                        id="carbs"
                        value={mealForm.carbs}
                        onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="fat">Fat (g)</label>
                      <input
                        type="number"
                        id="fat"
                        value={mealForm.fat}
                        onChange={(e) => setMealForm({ ...mealForm, fat: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      value={mealForm.notes}
                      onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                      placeholder="Any additional notes..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddMealModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveMeal}
                  disabled={!mealForm.name.trim()}
                >
                  Add Meal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Meal Modal */}
        {showEditMealModal && (
          <div className="modal-overlay" onClick={() => setShowEditMealModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Meal</h3>
                <button className="modal-close" onClick={() => setShowEditMealModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="meal-form">
                  <div className="form-group">
                    <label htmlFor="editMealType">Meal Type</label>
                    <select
                      id="editMealType"
                      value={mealForm.type}
                      onChange={(e) => setMealForm({ ...mealForm, type: e.target.value })}
                    >
                      {Object.entries(mealTypes).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="editMealName">Meal Name</label>
                    <input
                      type="text"
                      id="editMealName"
                      value={mealForm.name}
                      onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                      placeholder="e.g., Grilled chicken salad"
                      required
                    />
                  </div>
                  
                  <div className="nutrition-inputs">
                    <div className="form-group">
                      <label htmlFor="editCalories">Calories</label>
                      <input
                        type="number"
                        id="editCalories"
                        value={mealForm.calories}
                        onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="editProtein">Protein (g)</label>
                      <input
                        type="number"
                        id="editProtein"
                        value={mealForm.protein}
                        onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="editCarbs">Carbs (g)</label>
                      <input
                        type="number"
                        id="editCarbs"
                        value={mealForm.carbs}
                        onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="editFat">Fat (g)</label>
                      <input
                        type="number"
                        id="editFat"
                        value={mealForm.fat}
                        onChange={(e) => setMealForm({ ...mealForm, fat: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="editNotes">Notes (Optional)</label>
                    <textarea
                      id="editNotes"
                      value={mealForm.notes}
                      onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                      placeholder="Any additional notes..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowEditMealModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveMeal}
                  disabled={!mealForm.name.trim()}
                >
                  Update Meal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Delete Meal</h3>
                <button className="modal-close" onClick={cancelDelete}>×</button>
              </div>
              
              <div className="modal-body">
                <p>Are you sure you want to delete "{deletingMeal?.name}"? This action cannot be undone.</p>
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={confirmDeleteMeal} style={{ background: 'var(--error-color)' }}>
                  Delete Meal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}