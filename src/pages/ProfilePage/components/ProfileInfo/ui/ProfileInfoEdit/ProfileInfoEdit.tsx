import { observer } from 'mobx-react';
import * as React from 'react';

import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
import { FormField, ImageUploadButton, SelectDropdown } from 'components/common';
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
  const profileErrors = store.profileFormErrors;

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
            <FormField
              className={s.field}
              label="Username"
              labelClassName={s.label}
              error={profileErrors.username}
              errorClassName={s.error}
              required
              requiredMarkClassName={s.requiredMark}
            >
              <input
                className={store.profileFormErrors.username ? s.inputError : undefined}
                value={store.profileForm.username}
                onChange={(e) => store.updateProfileField('username', e.target.value)}
                placeholder="Username"
              />
            </FormField>
            <FormField
              className={s.field}
              label="Фамилия"
              labelClassName={s.label}
              error={profileErrors.lastName}
              errorClassName={s.error}
              required
              requiredMarkClassName={s.requiredMark}
            >
              <input
                className={store.profileFormErrors.lastName ? s.inputError : undefined}
                value={store.profileForm.lastName}
                onChange={(e) => store.updateProfileField('lastName', e.target.value)}
                placeholder="Фамилия"
              />
            </FormField>
            <FormField
              className={s.field}
              label="Имя"
              labelClassName={s.label}
              error={profileErrors.firstName}
              errorClassName={s.error}
              required
              requiredMarkClassName={s.requiredMark}
            >
              <input
                className={store.profileFormErrors.firstName ? s.inputError : undefined}
                value={store.profileForm.firstName}
                onChange={(e) => store.updateProfileField('firstName', e.target.value)}
                placeholder="Имя"
              />
            </FormField>
            <FormField className={s.field} label="Отчество" labelClassName={s.label}>
              <input
                value={store.profileForm.middleName}
                onChange={(e) => store.updateProfileField('middleName', e.target.value)}
                placeholder="Отчество"
              />
            </FormField>
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
            <FormField className={s.field} label="Обо мне" labelClassName={s.label}>
              <textarea
                value={store.teacherProfileForm.bio}
                onChange={(e) => store.updateTeacherField('bio', e.target.value)}
                placeholder="Расскажите о себе, стиле преподавания и подходе к ученикам"
                rows={5}
              />
            </FormField>
            <div className={s.fieldGrid}>
              <FormField className={s.field} label="Опыт" labelClassName={s.label}>
                <input
                  type="number"
                  min="0"
                  value={store.teacherProfileForm.experience}
                  onChange={(e) => store.updateTeacherField('experience', e.target.value)}
                  placeholder="Опыт в годах"
                />
              </FormField>
            </div>
            <FormField className={s.field} label="Специализации" labelClassName={s.label}>
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
            </FormField>
            <FormField className={s.field} label="Достижения" labelClassName={s.label}>
              <textarea
                value={store.teacherProfileForm.achievements}
                onChange={(e) => store.updateTeacherField('achievements', e.target.value)}
                placeholder="Достижения, каждое с новой строки"
                rows={4}
              />
            </FormField>
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
