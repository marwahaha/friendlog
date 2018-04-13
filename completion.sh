function _fl () {
  local cur
  local names
  local args
  local args_with_names
  COMPREPLY=()
  args="add list info edit history hangout help"
  args_with_names="info edit history hangout"
  cur=${COMP_WORDS[COMP_CWORD]}
  if [ $COMP_CWORD -eq 1 ]; then
    COMPREPLY=($(compgen -W "$args" -- "$cur"))
  elif [ $COMP_CWORD -eq 2 ]; then
    prev=${COMP_WORDS[COMP_CWORD-1]}
    if [[ $args_with_names =~ (^|[[:space:]])"$prev"($|[[:space:]]) ]]; then
      names=$(/Users/kmarwaha/Desktop/fl/index.js info -n) ## todo, change to fl
      COMPREPLY=($(compgen -W "$names" -- "$cur"))
    fi
  fi

  return 0
}

function _flh () {
  local cur
  local names
  COMPREPLY=()
  if [ $COMP_CWORD -eq 1 ]; then
    cur=${COMP_WORDS[COMP_CWORD]}
    names=$(/Users/kmarwaha/Desktop/fl/index.js info -n) ## todo, change to fl
    COMPREPLY=($(compgen -W "$names" -- "$cur"))
  fi

  return 0
}

complete -F _fl fl
complete -F _fl friendlog
complete -F _flh flh
