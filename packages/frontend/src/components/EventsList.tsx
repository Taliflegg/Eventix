import { Event, EventsResponse, MealType } from '@eventix/shared';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';
import Swal from 'sweetalert2';
import { ListItemText } from '@mui/material';
// import styles from "../css/Login.module.css";

import { EventTemplate } from './eventTemplates'; // adapte le chemin si besoin
import Form from './Form'; // <-- c'est ton vrai composant de formulaire
import TablePagination from '@mui/material/TablePagination';
import { FaUserCircle } from 'react-icons/fa';
import eventService, { EventFilterOptions, SortBy, SortDir } from '../services/eventsService';
import EventCard from './EventCard';
import DietaryRestrictionsManager from './DietaryRestrictionsManager';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemIcon, MenuItem, Select, TextField } from '@mui/material';
import { fetchAuthenticatedUser } from '../services/usersService';
import EventCreateModeDialog from './templatesDialog';
function EventsList() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);


  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'cards' | 'rows'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5); // ברירת מחדל 5
  const [totalItem, setTotalItem] = useState<number>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // מצב חדש לניהול פתיחת הטופס
  const [showCreateModeDialog, setShowCreateModeDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [templateToUse, setTemplateToUse] = useState<Partial<EventTemplate> | null>(null);
  // פילטר
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentSortBy, setcurrentSortBy] = useState<SortBy>('name');
  const [currentSortDir, setcurrentSortDir] = useState<SortDir>('asc');
  // דיאלוגים
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterKey, setFilterKey] = useState<string>('title');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filterMealTypes, setFilterMealTypes] = useState<MealType[]>([]);

  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [sortKey, setSortKey] = useState<string>('title');
  const [sortOrderDialog, setSortOrderDialog] = useState<'asc' | 'desc'>('asc');
  const { t }: { t: (key: string) => string } = useTranslation();
  const MEAL_TYPES: MealType[] = [
    'meat', 'dairy', 'vegetarian', 'vegan', 'kosher', 'bbq', 'other'
  ];
  const FILTER_KEYS = [
    { value: 'title', label: 'כותרת' },
    { value: 'date', label: 'תאריך' },
    { value: 'mealType', label: 'סוג הארוחה' }
  ];

  const SORT_KEYS = [
    { value: 'title', label: 'לפי כותרת', sortAsc: 'title', sortDesc: 'titleDescending' },
    { value: 'mealType', label: 'לפי סוג הארוחה', sortAsc: 'mealType', sortDesc: 'mealTypeDescending' },
    { value: 'date', label: 'לפי תאריך', sortAsc: 'date', sortDesc: 'dateDescending' }
  ];

  const SORT_OPTIONS = [
    { value: 'asc', label: 'מהתחלה לסוף' },
    { value: 'desc', label: 'מהסוף להתחלה' }
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get('page') || '1', 10);
  // loadEvents ללא opts, אבל עם כל התלויות
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      
      const response = await eventService.getEvents(currentPage,itemsPerPage);
      if (response.success) {
        setEvents(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalItem(response.totalItems);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchTitle,
    selectedMealTypes,
    selectedDate,
    currentSortBy,
    currentSortDir
  ]);
  const handleEventClick = (event: Event) => {
    navigate(`/event/${event.id}?page=${currentPage}`);
  };
  // מריצים כשמשהו משתנה
  useEffect(() => {
    loadEvents();
  }, [
    loadEvents
  ]);

  // ואז ב־apply פשוט מעדכנים סטייט—בלי לקרוא loadEvents ידנית
  //פילטור
  const handleApplyFilter = () => {
    setSearchTitle(filterKey === 'title' ? filterValue.trim() : '');
    setSelectedDate(filterKey === 'date' ? filterValue : '');
    setSelectedMealTypes(filterKey === 'mealType' ? filterMealTypes : []);
    setCurrentPage(1);
    setFilterDialogOpen(false);
  };
  //מיון
  const handleApplySort = () => {
    setcurrentSortBy(mapSortKeyToSortBy(sortKey));
    setcurrentSortDir(sortOrderDialog);
    setCurrentPage(1);
    setSortDialogOpen(false);
  };


  // בתוך הקומפוננטה שלך
  const getPaginationBtnClass = () => {
    if (itemsPerPage <= 5) return 'px-2 py-0.5 text-xs';       // קטן מאוד
    if (itemsPerPage <= 10) return 'px-3 py-1 text-sm';       // קטן-בינוני
    if (itemsPerPage <= 20) return 'px-4 py-1.5 text-base';   // בינוני-גדול
    return 'px-5 py-2 text-lg';                               // גדול מאוד
  };
  useEffect(() => {
    // טעינה לפי הפרמטר מה-URL ולפי מספר פריטים לעמוד
    loadEvents();
  }, [loadEvents, pageFromUrl, itemsPerPage]);


  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t('EventList.confirm delete'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('EventList.delete'),
      cancelButtonText: t('EventList.cancel'),
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085D6',
    });
    if (!result.isConfirmed) return;
    try {
      await eventService.delete(id);
      await loadEvents();
      toast.success(t('EventList.delete success'), { position: 'top-center', autoClose: 2500 });
    } catch (err) {
      toast.error(t('EventList.delete error'), { position: 'top-center', autoClose: 3000 });
    }
  };
  // טיפול בהצלחת יצירת אירוע
  const handleFormSuccess = () => {
    loadEvents(); // טעינה מחדש של האירועים
  };
  //כדי לדעת מי מחובר... דרך ה API
  useEffect(() => {
    const loadUser = async () => {

      try {
        const user = await fetchAuthenticatedUser();
        setCurrentUserId(user?.id);
        setIsAdmin(user?.role === 'administrator');
        console.log(isAdmin)

      } catch (err) {
        console.error('Failed to fetch current user', err);
      }
    };
    loadUser();
  }, []);
  const clearSelection = () => {
    setSelectedEvent(null);
  };
  // ממפה את המפתח מהדיאלוג לערך חוקי של SortBy
  const mapSortKeyToSortBy = (key: string): SortBy => {
    switch (key) {
      case 'title':
        return 'name';
      case 'mealType':
        return 'mealType';
      case 'date':
      default:
        return 'date';
    }
  };


  return (
    <div>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 10px',
        backgroundColor: '#282C34',
        color: 'white'
      }}>
        <h2>{t('EventList.events')} ({totalItem})</h2>
      </header>

      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>


        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="primary" onClick={() => setFilterDialogOpen(true)}>
            פילטר
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setSortDialogOpen(true)}>
            מיין
          </Button>
        </div>

        {/* דיאלוג פילטר */}
        <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
          <DialogTitle>סינון</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>key</InputLabel>
              <Select
                value={filterKey}
                label="key"
                onChange={e => {
                  setFilterKey(e.target.value as string);
                  setFilterValue('');
                  setFilterMealTypes([]);
                }}
              >
                {FILTER_KEYS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {filterKey === 'mealType' ? (
              <FormControl fullWidth margin="normal">
                <InputLabel>value</InputLabel>
                <Select
                  multiple
                  value={filterMealTypes}
                  onChange={e => setFilterMealTypes(e.target.value as MealType[])}
                  renderValue={selected => (selected as string[]).join(', ')}
                >
                  {MEAL_TYPES.map(type => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={filterMealTypes.indexOf(type) > -1} />
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : filterKey === 'date' ? (
              <TextField
                fullWidth
                margin="normal"
                label="תאריך"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filterValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
              />
            ) : (
              <TextField
                fullWidth
                margin="normal"
                label="כותרת"
                value={filterValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleApplyFilter} variant="contained" color="primary">החל</Button>
          </DialogActions>
        </Dialog>

        {/* דיאלוג מיין */}
        <Dialog open={sortDialogOpen} onClose={() => setSortDialogOpen(false)}>
          <DialogTitle>מיון</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>key</InputLabel>
              <Select
                value={sortKey}
                label="key"
                onChange={e => setSortKey(e.target.value as string)}
              >
                {SORT_KEYS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>סדר</InputLabel>
              <Select
                value={sortOrderDialog}
                label="סדר"
                onChange={e => setSortOrderDialog(e.target.value as 'asc' | 'desc')}
              >
                {SORT_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSortDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleApplySort} variant="contained" color="primary">החל</Button>
          </DialogActions>
        </Dialog>


        {/*כפתור להוספת אירוע*/}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            style={{
              marginRight: '10px',
              backgroundColor: '#28A745',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.2s',
            }}
            onClick={() => setShowCreateModeDialog(true)} // <-- Ouvre le dialog de choix au lieu du formulaire direct
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28A745'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {t('EventList.add new event')}
          </button>
          <EventCreateModeDialog
            open={showCreateModeDialog}
            onClose={() => setShowCreateModeDialog(false)}
            onSelectClassic={() => {
              setShowCreateModeDialog(false); // ferme le dialog
              setTemplateToUse(null);         // pas de template
              setIsFormOpen(true);            // ouvre le formulaire classique
            }}
            onSelectTemplate={(template) => {
              setShowCreateModeDialog(false); // ferme le dialog
              setTemplateToUse(template);     // stocke le template choisi
              setIsFormOpen(true);            // ouvre le formulaire pré-rempli
            }}
          />
        </div>

        {/*  ניהול מגבלות תזונה */}
        {isAdmin && (
          <div className="my-8">
            <DietaryRestrictionsManager isAdmin={true} />
          </div>
        )}

        {isFormOpen && (
          <Form
            onClose={() => {
              setIsFormOpen(false);
              setTemplateToUse(null); // <-- reset le template après fermeture
            }}
            onSuccess={handleFormSuccess}
            templateData={templateToUse || undefined} // <-- passe le template au formulaire
          />
        )}
        {/* טופס יצירת אירוע
        {isFormOpen && (
          <FormTailwind
            onClose={closeForm}
            onSuccess={handleFormSuccess}
          /> */}
        {/*הצגת שורות וכרטיסים*/}
        <div style={{ marginBottom: '20px' }}>
          {/*הצגת  וכרטיסים*/}
          <button
            onClick={() => setViewMode('cards')}
            style={{
              marginRight: '10px',
              backgroundColor: viewMode === 'cards' ? '#007BFF' : '#ccc',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              margin: '7px'
            }}
          >
            {t('EventList.card display')}
          </button>
          {/*הצגת  שורות*/}

          <button
            onClick={() => setViewMode('rows')}
            style={{
              backgroundColor: viewMode === 'rows' ? '#007BFF' : '#ccc',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {t('EventList.row display')}
          </button>
        </div>

        {/* אירועים קודמים */}
        {events.length > 0 ? (
          <div>

            {viewMode === 'cards' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px',
                }}
              >
                {!currentUserId ? (
                  <p>טוען משתמש...</p>
                ) : (
                  events.map((event) =>

                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={handleEventClick}
                      onDelete={handleDelete}
                      isOrganizer={currentUserId === event.createdBy}
                      currentUserId={currentUserId}
                    />

                  ))}
              </div>

            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F2F2F2' }}>
                    <th></th> {/* עמודה למחיקה */}
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t('EventList.title')}</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t('EventList.date')}</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t('EventList.location')}</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t('EventList.role')}</th>
                    <th></th> {/* עמודה לצפייה */}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {event.createdBy === currentUserId && (
                          <button
                            style={{
                              padding: '4px 8px',
                              backgroundColor: loading ? '#ccc' : 'red',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => handleDelete(event.id)}
                          >{t('EventList.delete')}</button>
                        )}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{event.title}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(event.datetime).toLocaleString()}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{event.location}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}> {event.createdBy === currentUserId ? `organizer` : `participant`}</td>

                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <button
                          style={{
                            padding: '4px 8px',
                            backgroundColor: loading ? '#ccc' : '#28A745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleEventClick(event)}
                        >{t('EventList.show')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#F8D7DA',
            color: '#721C24',
            border: '1px solid #F5C6CB',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            Error: {error}
          </div>
        )}
        {/*כל מה שקשור לPaging*/}

        {/* Pagination - now part of normal document flow */}
        <div className="w-full bg-transparent px-4 py-4 border-t border-gray-200 rtl:text-right mt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-0">


            {/* TablePagination */}
            <div className="overflow-x-auto">
              <TablePagination
                component="div"
                count={totalItem ?? 0}
                page={currentPage - 1}
                onPageChange={(event, newPage) => {
                  setCurrentPage(newPage + 1); // זה מספיק, useEffect כבר יטען לבד
                }}

                rowsPerPage={itemsPerPage}
                onRowsPerPageChange={(event: any) => {
                  const newSize = parseInt(event.target.value, 10);
                  setItemsPerPage(newSize);
                  setCurrentPage(1); // נחזור לעמוד הראשון, והטעינה תקרה לבד
                }}

                rowsPerPageOptions={[5, 10, 20, 50]}
                labelRowsPerPage={t('EventList.Number of events per page')}
              />
            </div>

            {/* כפתורי עמודים */}
          {totalPages > 1 && (
  <div className="flex flex-wrap justify-center items-center gap-2">
    {/* Previous */}
    <button
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      className={`px-4 py-1 rounded ${currentPage === 1
        ? 'text-gray-400 cursor-not-allowed'
        : 'hover:bg-gray-100'
      }`}
    >
      {t('EventList.previous')}
    </button>

    {/* Page numbers with ellipsis */}
    {(() => {
      const pages: number[] = [];
      const maxVisiblePages = 5;

      // תמיד מציגים את הראשון
      pages.push(1);

      if (totalPages <= maxVisiblePages) {
        for (let i = 2; i <= totalPages; i++) pages.push(i);
      } else {
        let startPage = Math.max(2, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);

        if (currentPage <= 3) {
          endPage = Math.min(totalPages - 1, maxVisiblePages);
        }
        if (currentPage >= totalPages - 2) {
          startPage = Math.max(2, totalPages - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
          if (!pages.includes(i)) pages.push(i);
        }
        if (!pages.includes(totalPages)) pages.push(totalPages);
      }

      const finalPages: JSX.Element[] = [];
      for (let i = 0; i < pages.length; i++) {
        if (i > 0 && pages[i] - pages[i - 1] > 1) {
          finalPages.push(
            <span key={`ellipsis-${i}`} className="px-2 text-gray-500">
              ...
            </span>
          );
        }
        finalPages.push(
          <button
            key={pages[i]}
            onClick={() => setCurrentPage(pages[i])}
            className={`${getPaginationBtnClass()} rounded ${
              currentPage === pages[i]
                ? 'font-bold underline text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {pages[i]}
          </button>
        );
      }
      return finalPages;
    })()}

    {/* Next */}
    <button
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      className={`px-4 py-1 rounded ${currentPage === totalPages
        ? 'text-gray-400 cursor-not-allowed'
        : 'hover:bg-gray-100'
      }`}
    >
      {t('EventList.next')}
    </button>
  </div>
)}


          </div>
        </div>







        {/*במקרה שלוחצים על אירוע*/}
        {selectedEvent && (
          <div>
            <button
              onClick={clearSelection}
              style={{
                marginBottom: '20px',
                padding: '8px 16px',
                backgroundColor: '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              ← {t('EventList.back to events')}
            </button>
            <h2>{t('EventList.event details')}</h2>
            <EventCard event={selectedEvent} />
          </div>
        )}
      </main>
    </div>
  );
}
export default EventsList;