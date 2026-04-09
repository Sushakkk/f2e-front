import { observer } from 'mobx-react';
import * as React from 'react';

import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
import { ImageUploadButton, SelectDropdown } from 'components/common';
import Button from 'components/common/Button/Button';
import type { ProfilePageStore } from 'store/ProfilePageStore';
import { useDanceStylesStore } from 'store/hooks';

import { ProfileInfoCard } from '../ProfileInfoCard';

import s from './ProfileInfoEdit.module.scss';

type Props = {
  store: ProfilePageStore;
};

const ProfileInfoEditComponent: React.FC<Props> = ({ store }) => {
  const danceStylesStore = useDanceStylesStore();
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    void danceStylesStore.requestDanceStyles();
  }, [danceStylesStore]);

  return (
    <div className={s.panel}>
      <div className={s.form}>
        <ProfileInfoCard
          title="Основные данные"
          hint="Редактируйте информацию, которая видна в профиле."
          className={s.formSection}
        >
          <img
            className={s.avatarPreview}
            src={store.avatarPreview || fallbackImage}
            alt="Превью аватара"
          />
          <div className={s.fieldGrid}>
            <label className={s.field}>
              <span className={s.label}>Username</span>
              <input
                className={s.input}
                value={store.profileForm.username}
                onChange={(e) => store.updateProfileField('username', e.target.value)}
                placeholder="Username"
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Фамилия</span>
              <input
                className={s.input}
                value={store.profileForm.lastName}
                onChange={(e) => store.updateProfileField('lastName', e.target.value)}
                placeholder="Фамилия"
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Имя</span>
              <input
                className={s.input}
                value={store.profileForm.firstName}
                onChange={(e) => store.updateProfileField('firstName', e.target.value)}
                placeholder="Имя"
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Отчество</span>
              <input
                className={s.input}
                value={store.profileForm.middleName}
                onChange={(e) => store.updateProfileField('middleName', e.target.value)}
                placeholder="Отчество"
              />
            </label>
          </div>
          <input
            ref={avatarInputRef}
            className={s.fileInput}
            type="file"
            accept="image/*"
            onChange={(e) => store.setAvatarFile(e.target.files?.[0] ?? null)}
          />
          <Button
            mode="purpleDashed"
            type="button"
            className={s.utilityBtn}
            onClick={() => avatarInputRef.current?.click()}
          >
            Обновить фото профиля
          </Button>
        </ProfileInfoCard>
        {store.isTeacherView && (
          <ProfileInfoCard
            title="Профиль преподавателя"
            hint="Эти данные будут оформлять вашу преподавательскую страницу."
            className={s.formSection}
          >
            <label className={s.field}>
              <span className={s.label}>Обо мне</span>
              <textarea
                className={s.textarea}
                value={store.teacherProfileForm.bio}
                onChange={(e) => store.updateTeacherField('bio', e.target.value)}
                placeholder="Расскажите о себе, стиле преподавания и подходе к ученикам"
                rows={5}
              />
            </label>
            <div className={s.fieldGrid}>
              <label className={s.field}>
                <span className={s.label}>Опыт</span>
                <input
                  className={s.input}
                  type="number"
                  min="0"
                  value={store.teacherProfileForm.experience}
                  onChange={(e) => store.updateTeacherField('experience', e.target.value)}
                  placeholder="Опыт в годах"
                />
              </label>
            </div>
            <label className={s.field}>
              <span className={s.label}>Специализации</span>
              <SelectDropdown
                mode="multi"
                options={danceStylesStore.options}
                value={store.teacherProfileForm.specializations
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean)}
                searchable
                placeholder="Выберите специализации"
                onChange={(value) => store.updateTeacherField('specializations', value.join('\n'))}
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Достижения</span>
              <textarea
                className={s.textarea}
                value={store.teacherProfileForm.achievements}
                onChange={(e) => store.updateTeacherField('achievements', e.target.value)}
                placeholder="Достижения, каждое с новой строки"
                rows={4}
              />
            </label>
            <ImageUploadButton
              label="Добавить фотографии"
              className={s.utilityBtn}
              multiple
              onSelect={(files) => {
                void store.addTeacherImages(files);
              }}
            />
            {store.teacherImagePreviews.length > 0 && (
              <div className={s.gallery}>
                {store.teacherImagePreviews.map((image, index) => (
                  <div key={`${image}-${index}`} className={s.galleryItem}>
                    <img className={s.galleryImage} src={image} alt={`Фото ${index + 1}`} />
                    <Button
                      mode="purpleDashed"
                      type="button"
                      className={s.utilityBtn}
                      onClick={() => store.removeTeacherImage(index)}
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ProfileInfoCard>
        )}
        {store.profileError && <div className={s.errorBox}>{store.profileError}</div>}
        <div className={s.primaryActions}>
          <Button
            mode="purple"
            onClick={() => void store.saveProfile()}
            disabled={store.isSavingProfile}
          >
            {store.isSavingProfile ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
          <Button mode="dark" onClick={store.cancelProfileEdit}>
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProfileInfoEdit = observer(ProfileInfoEditComponent);

export default ProfileInfoEdit;
