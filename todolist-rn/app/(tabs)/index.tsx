import { StyleSheet, Platform, View, Pressable, Dimensions, Text, TextInput, KeyboardAvoidingView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useEffect, useState } from 'react';
import { TodoDto } from '@/models/todosDto';
import { TodoForm } from '@/models/todoForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTodo, completeTodo, deleteTodo, fetchAllTodos, FilterType, openTodo } from '@/api/api';
import { useTodosQuery } from '@/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, borderWidth } from '@/constants';
import { CustomButton } from '@/components/ui';
import Animated, { FadeInUp } from 'react-native-reanimated';
import uuid from 'react-native-uuid';
import { produce } from 'immer';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { Keyboard } from 'react-native';

export default function HomeScreen() {
  // hooks
  const [title, setTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const queryClient = useQueryClient();
  const { bottom, top } = useSafeAreaInsets();

  const { data, error, refetch } = useTodosQuery('all');

  const theme = useColorScheme();

  // TODO: extract this mutation logic into a seperate reusable hook so it can be accessed in other locations. This will do for now.
  const { mutate } = useMutation(
    {
      mutationFn: addTodo,
      onMutate: async (newTodo: TodoDto) => {
        await queryClient.cancelQueries({ queryKey: ['todos'] });

        const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);
        // Optimistically update to the new value
        queryClient.setQueryData(['todos'], (old: TodoDto[]) => {
          return [...old, { ...newTodo }];
        });
        // Return a context object with the snapshotted value
        console.log('🚀 ~ onMutate: ~ previous:', previous);
        return { previous };
      },
      onError: (err, newTodo, context) => {
        if (context?.previous) {
          queryClient.setQueryData(['todos'], [...context?.previous, { ...newTodo, todoId: uuid.v4() }]);
        }
      },
      // Refetch when done
      onSettled: () => {
        console.log('🚀 ~ HomeScreen ~ queryClient:');

        queryClient.invalidateQueries();
        if (Platform.OS == 'web') {
          refetch();
        }
      },
    },
    queryClient,
  );

  const { mutate: deleteTodoMutation } = useMutation({
    mutationFn: deleteTodo,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);
      // Optimistically update to the new value
      queryClient.setQueryData(['todos'], (old: TodoDto[]) => {
        const newArray = old.filter((x) => x.todoId !== id);
        return newArray;
      });
      // Return a context object with the snapshotted value
      return { previous };
    },
    // Refetch when done
    onSettled: () => {
      //   console.log('🚀 ~ HomeScreen ~ queryClient:', queryClient.unmount);
      queryClient.invalidateQueries();
      if (Platform.OS == 'web') {
        refetch();
      }
    },
  });

  const { mutate: completionMutation } = useMutation({
    mutationFn: completeTodo,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);

      const todoToUpdate = previous?.find((x) => x.todoId === id);
      if (todoToUpdate) {
        queryClient.setQueryData(['todos'], () => {
          produce((old) => {
            const updated = old.find((x) => x.todoId === id);
            if (updated) {
              updated.completedAt = new Date();
            }
          });
        });

        // Return a context object with the snapshotted value
        return { previous };
      }
      // Optimistically update to the new value
    },
    onError: (err, id, context) => {
      console.log('🚀 ~ HomeScreen ~ err:', err);
      if (context?.previous) {
        queryClient.setQueryData(['todos'], (old: TodoDto[] = []) => {
          return produce(old, (draft) => {
            const updated = draft.find((x) => x.todoId === id);
            if (updated) {
              updated.completedAt = new Date();
            }
          });
        });

        // Return a context object with the snapshotted value
      } else {
        console.log(context?.previous, 'PREVIOUS');
        return context?.previous;
      }
    },
    // Refetch when done
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      if (Platform.OS == 'web') {
        refetch();
      }
    },
  });

  const { mutate: openTodoMutation } = useMutation({
    mutationFn: openTodo,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);
      const todoToUpdate = previous?.find((x) => x.todoId === id);
      if (todoToUpdate) {
        queryClient.setQueryData(['todos'], (old: TodoDto[] = []) => {
          produce(old, (draft) => {
            const updated = draft.find((x) => x.todoId === id);
            if (updated) {
              updated.completedAt = undefined;
            }
          });
        });

        // Return a context object with the snapshotted value
        return { previous };
      }
      // Optimistically update to the new value
    },
    onError: (error, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['todos'], (old: TodoDto[] = []) => {
          return produce(old, (draft) => {
            const updated = draft.find((x) => x.todoId === id);
            if (updated) {
              updated.completedAt = undefined;
            }
          });
        });

        // Return a context object with the snapshotted value
      } else {
        console.log(context?.previous, 'PREVIOUS');
        return context?.previous;
      }
    },
    // Refetch when done
    onSettled: () => {
      queryClient.invalidateQueries();
      if (Platform.OS == 'web') {
        refetch();
      }
    },
  });

  // handlers
  const handleAddNew = () => {
    console.log(title);
    const newTodo: TodoForm = {
      title: title,
    };
    mutate(newTodo);
    Keyboard.dismiss();
  };

  const handlePressCheckbox = (id: number) => {
    const foundItem = data?.find((x) => x.todoId === id);
    if (foundItem?.completedAt) {
      openTodoMutation(id);
    } else {
      completionMutation(id);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      deleteTodoMutation(id);
    }
  };
  return (
    <KeyboardAvoidingView behavior="height" style={[styles.container, { marginBottom: bottom, marginTop: top }]}>
      {/* // TODO: move into reusable component */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 4 }}>
        <View style={{ flex: 1 }}>
          <ThemedText>ToDo List</ThemedText>
        </View>
        {error && (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ThemedText>Unable to reach API</ThemedText>
          </View>
        )}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {data.length > 0 && (
            <CustomButton
              label={editMode ? 'Editing' : 'Edit Mode'}
              buttonType={'primary'}
              buttonSize={'small'}
              onPress={() => {
                setEditMode(!editMode);
              }}
            />
          )}
        </View>
      </View>
      <Animated.FlatList
        data={data}
        contentContainerStyle={{ height: Dimensions.get('screen').height - 100, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        scrollEnabled
        renderItem={({ item, index }) => {
          return (
            <View style={{ padding: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row' }}>
                <Pressable
                  hitSlop={10}
                  onPress={() => handlePressCheckbox(item.todoId ?? 0)}
                  style={[
                    styles.checkbox,
                    { borderColor: theme == 'dark' ? 'white' : 'black' },
                    item.completedAt ? { backgroundColor: 'blue' } : { backgroundColor: 'transparent' },
                  ]}
                />
                <ThemedText>{item.title}</ThemedText>
              </View>
              {editMode && (
                <CustomButton
                  hitSlop={10}
                  onPress={() => handleDelete(item?.todoId)}
                  label={'Delete'}
                  buttonType={'danger'}
                  buttonSize={'small'}
                />
              )}
            </View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4 }}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={{ padding: 4, borderWidth: 1, borderColor: 'black', color: theme == 'dark' ? 'white' : 'black' }}
            value={title}
            onChangeText={(val) => setTitle(val)}
            placeholder={'Enter a todo item'}
          />
        </View>
        <View>
          <Pressable onPress={handleAddNew} style={[{ width: 60, padding: 4, borderRadius: 4 }]}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Add</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: Dimensions.get('screen').height - 200,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  checkbox: {
    borderRadius: borderRadius,
    borderWidth: borderWidth,
    borderColor: 'black',
    marginRight: 4,
    width: 24,
    height: 24,
  },
});
