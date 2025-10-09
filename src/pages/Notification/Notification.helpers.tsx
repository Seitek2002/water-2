import archiverIcon from 'assets/icons/archive.svg';
import documentIcon from 'assets/icons/document.svg';

export const data = [
  {
    date: 'Сегодня',
    items: [{ title: 'Отдел Архитектура', text: 'Новый документ загружен в ТУ №212', icon: documentIcon }]
  },
  {
    date: 'Вчера',
    items: [
      { title: 'Отдел БГА', text: 'Новый документ загружен в ТУ №212', icon: archiverIcon },
      { title: 'Отдел ПТО', text: 'Новый документ загружен в ТУ №212', icon: archiverIcon }
    ]
  },
  {
    date: 'За последний месяц',
    items: [{ title: 'Бухгалтерия', text: 'Новый документ загружен в ТУ №212', icon: archiverIcon }]
  }
];
